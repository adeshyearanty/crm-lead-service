import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNoteDto } from '../dto/create-note.dto';
import { PaginatedResponse } from '../dto/pagination.dto';
import { UpdateNoteDto } from '../dto/update-note.dto';
import { Note, NoteDocument } from '../model/note.model';

@Injectable()
export class NoteRepository {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  async create(createNoteDto: CreateNoteDto): Promise<NoteDocument> {
    const note = new this.noteModel({
      ...createNoteDto,
      leadId: new Types.ObjectId(createNoteDto.leadId),
      createdBy: createNoteDto.createdBy,
    });
    return note.save();
  }

  async findById(noteId: string): Promise<NoteDocument> {
    const note = await this.noteModel.findById(noteId).exec();
    if (!note) {
      throw new NotFoundException(`Note with ID "${noteId}" not found`);
    }
    return note;
  }

  async findByLeadId(
    leadId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<PaginatedResponse<NoteDocument>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const baseQuery = { leadId: new Types.ObjectId(leadId) };

    const query = search
      ? {
          ...baseQuery,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
          ],
        }
      : baseQuery;

    const sort: Record<string, any> = {
      isPinned: -1,
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [notes, total] = await Promise.all([
      this.noteModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.noteModel.countDocuments(query),
    ]);

    return {
      items: notes,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async update(
    noteId: string,
    updateDto: UpdateNoteDto,
  ): Promise<NoteDocument> {
    // Create a shallow copy of updateDto, but handle leadId conversion for type safety
    const { leadId, ...rest } = updateDto;
    const update: Partial<NoteDocument> = { ...rest };

    if (leadId) {
      update.leadId = new Types.ObjectId(leadId);
    }
    if (updateDto.createdBy) {
      update.createdBy = updateDto.createdBy;
    }

    const updatedNote = await this.noteModel
      .findByIdAndUpdate(noteId, update, { new: true })
      .exec();

    if (!updatedNote) {
      throw new NotFoundException(`Note with ID "${noteId}" not found`);
    }

    return updatedNote;
  }

  async delete(noteId: string): Promise<NoteDocument> {
    const deletedNote = await this.noteModel.findByIdAndDelete(noteId).exec();

    if (!deletedNote) {
      throw new NotFoundException(`Note with ID "${noteId}" not found`);
    }

    return deletedNote;
  }

  async pin(noteId: string, pin: boolean): Promise<NoteDocument> {
    const pinnedNote = await this.noteModel
      .findByIdAndUpdate(
        noteId,
        { isPinned: pin, pinnedAt: pin ? new Date() : null },
        { new: true },
      )
      .exec();

    if (!pinnedNote) {
      throw new NotFoundException(`Note with ID "${noteId}" not found`);
    }

    return pinnedNote;
  }
}
