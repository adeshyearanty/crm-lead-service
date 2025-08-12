import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CommentController } from './comment.controller';
import { CommentService } from '../service/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentDocument } from '../model/comment.model';
import { PaginatedResponse } from '../dto/pagination.dto';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: jest.Mocked<CommentService>;

  const mockCommentService = {
    create: jest.fn(),
    findByNoteId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as const;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    commentService = module.get(CommentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const createDto: CreateCommentDto = {
        content: 'Test comment content',
        createdBy: 'user123',
        organizationId: 'org123',
      };
      const mockComment = {
        id: new Types.ObjectId().toHexString(),
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as CommentDocument;
      commentService.create.mockResolvedValue(mockComment);

      const result = await controller.create(noteId, createDto);

      expect(commentService.create).toHaveBeenCalledWith(noteId, createDto);
      expect(result).toEqual(mockComment);
    });

    it('should handle service errors', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const createDto: CreateCommentDto = {
        content: 'Test comment content',
        createdBy: 'user123',
        organizationId: 'org123',
      };
      const error = new Error('Service error');
      commentService.create.mockRejectedValue(error);

      await expect(controller.create(noteId, createDto)).rejects.toThrow(error);
    });
  });

  describe('findByNoteId', () => {
    it('should get comments by note ID with pagination', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const page = 1;
      const limit = 10;
      const sortOrder = 'desc' as const;
      const mockPaginatedResponse: PaginatedResponse<CommentDocument> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      };
      commentService.findByNoteId.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findByNoteId(
        noteId,
        page,
        limit,
        sortOrder,
      );

      expect(commentService.findByNoteId).toHaveBeenCalledWith(noteId, {
        page,
        limit,
        sortOrder,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle service errors', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const page = 1;
      const limit = 10;
      const sortOrder = 'desc' as const;
      const error = new Error('Service error');
      commentService.findByNoteId.mockRejectedValue(error);

      await expect(
        controller.findByNoteId(noteId, page, limit, sortOrder),
      ).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a comment successfully', async () => {
      const commentId = new Types.ObjectId().toHexString();
      const content = 'Updated comment content';
      const userId = 'user123';
      const mockComment = {
        id: commentId,
        content,
        createdBy: userId,
        organizationId: 'org123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as CommentDocument;
      commentService.update.mockResolvedValue(mockComment);

      const noteId = new Types.ObjectId().toHexString();
      const result = await controller.update(
        noteId,
        commentId,
        content,
        userId,
      );

      expect(commentService.update).toHaveBeenCalledWith(
        commentId,
        content,
        userId,
        noteId,
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw BadRequestException when userId is empty', () => {
      const commentId = new Types.ObjectId().toHexString();
      const content = 'Updated comment content';
      const userId = '';

      const noteId = new Types.ObjectId().toHexString();
      expect(() => {
        void controller.update(noteId, commentId, content, userId);
      }).toThrow(BadRequestException);
      expect(commentService.update).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const commentId = new Types.ObjectId().toHexString();
      const content = 'Updated comment content';
      const userId = 'user123';
      const error = new Error('Service error');
      commentService.update.mockRejectedValue(error);

      const noteId = new Types.ObjectId().toHexString();
      await expect(
        controller.update(noteId, commentId, content, userId),
      ).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete a comment successfully', async () => {
      const commentId = new Types.ObjectId().toHexString();
      const userId = 'user123';
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        createdBy: userId,
        organizationId: 'org123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as CommentDocument;
      commentService.delete.mockResolvedValue(mockComment);

      const noteId = new Types.ObjectId().toHexString();
      const result = await controller.delete(noteId, commentId, userId);

      expect(commentService.delete).toHaveBeenCalledWith(
        commentId,
        userId,
        noteId,
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw BadRequestException when userId is empty', () => {
      const commentId = new Types.ObjectId().toHexString();
      const userId = '';

      const noteId = new Types.ObjectId().toHexString();
      expect(() => {
        void controller.delete(noteId, commentId, userId);
      }).toThrow(BadRequestException);
      expect(commentService.delete).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const commentId = new Types.ObjectId().toHexString();
      const userId = 'user123';
      const error = new Error('Service error');
      commentService.delete.mockRejectedValue(error);

      const noteId = new Types.ObjectId().toHexString();
      await expect(
        controller.delete(noteId, commentId, userId),
      ).rejects.toThrow(error);
    });
  });
});
