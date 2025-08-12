import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityClientService } from '../client/activity-client.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PaginatedResponse } from '../dto/pagination.dto';
import { CommentDocument } from '../model/comment.model';
import { CommentRepository } from '../repository/comment.repository';
import { NoteRepository } from '../repository/note.repository';
import { ActivityType } from '../types/activity.type';
import { Types } from 'mongoose';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepo: CommentRepository,
    private readonly noteRepo: NoteRepository,
    private readonly activityClient: ActivityClientService,
  ) {}

  async create(
    noteId: string,
    createDto: CreateCommentDto,
  ): Promise<CommentDocument> {
    const trimmed = createDto.content?.trim();
    if (!trimmed) {
      throw new BadRequestException('Comment cannot be empty');
    }

    // Get the note to access leadId
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new NotFoundException(`Note with ID "${noteId}" not found`);
    }

    const comment = await this.commentRepo.create(noteId, {
      ...createDto,
      content: trimmed,
    });

    // Log comment creation activity
    await this.activityClient.logActivity({
      activityType: ActivityType.NOTE_COMMENT_ADDED,
      noteId,
      leadId: note.leadId.toString(),
      commentId: (comment._id as Types.ObjectId).toString(),
      description: `Comment added to note: ${note.title}`,
      performedBy: createDto.createdBy,
      metadata: {
        content: trimmed.slice(0, 100) + (trimmed.length > 100 ? '...' : ''),
      },
    });

    return comment;
  }

  async findByNoteId(
    noteId: string,
    options: {
      page?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<PaginatedResponse<CommentDocument>> {
    return this.commentRepo.findByNoteId(noteId, options);
  }

  async update(
    commentId: string,
    content: string,
    userId: string,
    noteId: string,
  ): Promise<CommentDocument> {
    const trimmed = content?.trim();
    if (!trimmed) {
      throw new BadRequestException('Comment cannot be empty');
    }

    // Get the note to access leadId
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new NotFoundException(`Note with ID "${noteId}" not found`);
    }

    const comment = await this.commentRepo.update(commentId, trimmed);

    // Log comment update activity
    await this.activityClient.logActivity({
      activityType: ActivityType.NOTE_COMMENT_UPDATED,
      noteId,
      leadId: note.leadId.toString(),
      commentId,
      description: `Comment updated from note: ${note.title}`,
      performedBy: userId,
      metadata: {
        content: trimmed.slice(0, 100) + (trimmed.length > 100 ? '...' : ''),
      },
    });

    return comment;
  }

  async delete(
    commentId: string,
    userId: string,
    noteId: string,
  ): Promise<CommentDocument> {
    // Get the note to access leadId
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new NotFoundException(`Note with ID "${noteId}" not found`);
    }

    const comment = await this.commentRepo.delete(commentId);

    // Log comment deletion activity
    await this.activityClient.logActivity({
      activityType: ActivityType.NOTE_COMMENT_DELETED,
      noteId,
      leadId: note.leadId.toString(),
      commentId,
      description: `Comment deleted from note: ${note.title}`,
      performedBy: userId,
      metadata: {},
    });

    return comment;
  }

  async deleteByNoteId(noteId: string): Promise<void> {
    await this.commentRepo.deleteByNoteId(noteId);
  }
}
