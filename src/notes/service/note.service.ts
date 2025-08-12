import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { ActivityClientService } from '../client/activity-client.service';
import { TaskClientService } from '../client/task-client.service';
import { CreateNoteDto } from '../dto/create-note.dto';
import { UpdateNoteDto } from '../dto/update-note.dto';
import { NoteDocument } from '../model/note.model';
import { NoteRepository } from '../repository/note.repository';
import { ActivityType } from '../types/activity.type';
import { TaskPriority, TaskStatus, TaskType } from '../types/task.type';
import { sanitizeContent } from '../utils/sanitize-content';
import { PaginatedResponse } from '../dto/pagination.dto';
import { CommentService } from './comment.service';
import { extractS3KeysFromContent } from '../utils/s3.utils';
import { S3ClientService } from '../client/s3-client.service';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(NoteService.name);

  constructor(
    private readonly noteRepo: NoteRepository,
    private readonly taskClient: TaskClientService,
    private readonly activityClient: ActivityClientService,
    private readonly commentService: CommentService,
    private readonly s3ClientService: S3ClientService,
  ) {}

  async create(createDto: CreateNoteDto): Promise<NoteDocument> {
    const trimmed = createDto.content?.trim();
    if (!trimmed) {
      throw new BadRequestException('Note cannot be empty');
    }

    createDto.content = sanitizeContent(trimmed);
    const note = await this.noteRepo.create(createDto);

    // Log note creation activity
    await this.activityClient.logActivity({
      activityType: ActivityType.NOTE_CREATED,
      noteId: (note._id as Types.ObjectId).toString(),
      leadId: createDto.leadId,
      description: `Note created: ${createDto.title}`,
      performedBy: createDto.createdBy,
      metadata: {
        leadId: createDto.leadId,
        content: trimmed.slice(0, 100) + (trimmed.length > 100 ? '...' : ''),
      },
    });

    // Create task if requested
    if (createDto.createTask && createDto.dueDate) {
      const taskPayload = {
        title: `Follow-up from Note: ${createDto.title}`,
        description: createDto.taskDescription || trimmed,
        dueDate: createDto.dueDate,
        leadId: createDto.leadId,
        noteId: (note._id as Types.ObjectId).toString(),
        type: TaskType.REMINDER,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        assignedTo: createDto.createdBy,
        createdBy: createDto.createdBy,
        organizationId: createDto.organizationId,
      };

      const task = await this.taskClient.create(taskPayload);
      note.createdTaskId = new Types.ObjectId(task.id);
      await note.save();
    }

    return note;
  }

  async findByLead(
    leadId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<PaginatedResponse<NoteDocument>> {
    return this.noteRepo.findByLeadId(leadId, options);
  }

  async update(
    noteId: string,
    updateDto: UpdateNoteDto,
  ): Promise<NoteDocument> {
    const existingNote = await this.noteRepo.findById(noteId);

    if (updateDto.content && !updateDto.content.trim()) {
      throw new BadRequestException('Note cannot be empty');
    }

    this.logger.debug(`Updating content: ${updateDto.content}`);

    if (updateDto.content) {
      updateDto.content = sanitizeContent(updateDto.content);
      this.logger.debug(`Sanitized content: ${updateDto.content}`);

      const oldKeys = extractS3KeysFromContent(existingNote.content);
      const newKeys = extractS3KeysFromContent(updateDto.content);

      const removedKeys = oldKeys.filter((key) => !newKeys.includes(key));
      for (const key of removedKeys) {
        try {
          await this.s3ClientService.deleteObject(key);
          this.logger.debug(`Deleted old image from S3: ${key}`);
        } catch (err) {
          this.logger.error(`Failed to delete S3 image: ${key}`, err);
        }
      }
    }

    const note = await this.noteRepo.update(noteId, updateDto);

    if (note && updateDto.createdBy && updateDto.organizationId) {
      await this.activityClient.logActivity({
        activityType: ActivityType.NOTE_UPDATED,
        noteId,
        leadId: note.leadId.toString(),
        description: `Note updated: ${updateDto.title}`,
        performedBy: updateDto.createdBy,
        metadata: {
          leadId: note.leadId.toString(),
          content: updateDto.content
            ? updateDto.content.slice(0, 100) +
              (updateDto.content.length > 100 ? '...' : '')
            : undefined,
        },
      });
    }

    return note;
  }

  async delete(noteId: string, userId: string): Promise<NoteDocument> {
    const note = await this.noteRepo.delete(noteId);

    if (note) {
      // 🧹 Clean up S3 images
      const keys = extractS3KeysFromContent(note.content);
      for (const key of keys) {
        try {
          await this.s3ClientService.deleteObject(key);
          this.logger.debug(`Deleted image from S3: ${key}`);
        } catch (err) {
          this.logger.error(`Failed to delete S3 image: ${key}`, err);
        }
      }

      // 🗨️ Delete all comments
      await this.commentService.deleteByNoteId(noteId);

      // 📝 Log activity
      await this.activityClient.logActivity({
        activityType: ActivityType.NOTE_DELETED,
        noteId,
        leadId: note.leadId.toString(),
        description: `Note deleted: ${note.title}`,
        performedBy: userId,
        metadata: {
          leadId: note.leadId.toString(),
        },
      });

      // 📆 Delete associated task
      if (note.createdTaskId) {
        await this.taskClient.delete(note.createdTaskId.toString());

        await this.activityClient.logActivity({
          activityType: ActivityType.NOTE_TASK_DELETED,
          noteId,
          leadId: note.leadId.toString(),
          description: `Task deleted with note: ${note.title}`,
          performedBy: userId,
          metadata: {
            taskId: note.createdTaskId.toString(),
            leadId: note.leadId.toString(),
          },
        });
      }
    }

    return note;
  }

  async pin(
    noteId: string,
    pin: boolean,
    userId: string,
    // organizationId: string,
  ): Promise<NoteDocument> {
    const note = await this.noteRepo.pin(noteId, pin);

    if (note) {
      // Log pin/unpin activity
      await this.activityClient.logActivity({
        activityType: pin
          ? ActivityType.NOTE_PINNED
          : ActivityType.NOTE_UNPINNED,
        noteId: noteId,
        leadId: note.leadId.toString(),
        description: pin
          ? `Note pinned: ${note.title}`
          : `Note unpinned: ${note.title}`,
        performedBy: userId,
        metadata: {
          leadId: note.leadId.toString(),
        },
      });
    }

    return note;
  }
}
