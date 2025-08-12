import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../model/comment.model';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PaginatedResponse } from '../dto/pagination.dto';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(
    noteId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentDocument> {
    const comment = new this.commentModel({
      ...createCommentDto,
      noteId: new Types.ObjectId(noteId),
    });
    return comment.save();
  }

  async findByNoteId(
    noteId: string,
    options: {
      page?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<PaginatedResponse<CommentDocument>> {
    const { page = 1, limit = 10, sortOrder = 'asc' } = options;

    const skip = (page - 1) * limit;
    const query = { noteId: new Types.ObjectId(noteId) };

    const [comments, total] = await Promise.all([
      this.commentModel
        .find(query)
        .sort({ createdAt: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commentModel.countDocuments(query),
    ]);

    return {
      items: comments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async update(commentId: string, content: string): Promise<CommentDocument> {
    const updatedComment = await this.commentModel
      .findByIdAndUpdate(commentId, { content }, { new: true })
      .exec();

    if (!updatedComment) {
      throw new NotFoundException(`Comment with ID "${commentId}" not found`);
    }

    return updatedComment;
  }

  async delete(commentId: string): Promise<CommentDocument> {
    const deletedComment = await this.commentModel
      .findByIdAndDelete(commentId)
      .exec();

    if (!deletedComment) {
      throw new NotFoundException(`Comment with ID "${commentId}" not found`);
    }

    return deletedComment;
  }

  async deleteByNoteId(noteId: string): Promise<void> {
    await this.commentModel
      .deleteMany({ noteId: new Types.ObjectId(noteId) })
      .exec();
  }
}
