import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentService } from '../service/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentDocument } from '../model/comment.model';
import { PaginatedResponse } from '../dto/pagination.dto';

@ApiTags('Notes')
@Controller({
  version: '1',
  path: 'notes/:noteId/comments',
})
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment on a note' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Param('noteId') noteId: string,
    @Body() createDto: CreateCommentDto,
  ): Promise<CommentDocument> {
    return this.commentService.create(noteId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a note' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findByNoteId(
    @Param('noteId') noteId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedResponse<CommentDocument>> {
    return this.commentService.findByNoteId(noteId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortOrder,
    });
  }

  @Put(':commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('noteId') noteId: string,
    @Param('commentId') commentId: string,
    @Body('content') content: string,
    @Query('userId') userId: string,
  ): Promise<CommentDocument> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.commentService.update(commentId, content, userId, noteId);
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  delete(
    @Param('noteId') noteId: string,
    @Param('commentId') commentId: string,
    @Query('userId') userId: string,
  ): Promise<CommentDocument> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.commentService.delete(commentId, userId, noteId);
  }
}
