import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { NoteController } from './note.controller';
import { NoteService } from '../service/note.service';
import { CreateNoteDto } from '../dto/create-note.dto';
import { UpdateNoteDto } from '../dto/update-note.dto';
import { NoteDocument } from '../model/note.model';
import { PaginatedResponse } from '../dto/pagination.dto';

describe('NoteController', () => {
  let controller: NoteController;
  let noteService: jest.Mocked<NoteService>;

  const mockNoteService = {
    create: jest.fn(),
    findByLead: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    pin: jest.fn(),
  } as const;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [
        {
          provide: NoteService,
          useValue: mockNoteService,
        },
      ],
    }).compile();

    controller = module.get<NoteController>(NoteController);
    noteService = module.get(NoteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a note successfully', async () => {
      const leadId = new Types.ObjectId().toHexString();
      const createDto: CreateNoteDto = {
        title: 'Test Note',
        content: 'Test content',
        createdBy: 'user123',
        organizationId: 'org123',
        leadId,
      };
      const mockNote = {
        id: new Types.ObjectId().toHexString(),
        ...createDto,
        isPinned: false,
        pinnedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as NoteDocument;
      noteService.create.mockResolvedValue(mockNote);

      const result = await controller.create(createDto);

      expect(noteService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockNote);
    });

    it('should handle service errors', async () => {
      const leadId = new Types.ObjectId().toHexString();
      const createDto: CreateNoteDto = {
        title: 'Test Note',
        content: 'Test content',
        createdBy: 'user123',
        organizationId: 'org123',
        leadId,
      };
      const error = new Error('Service error');
      noteService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(error);
    });
  });

  describe('getByLead', () => {
    it('should get notes by lead successfully', async () => {
      const leadId = new Types.ObjectId().toHexString();
      const page = 1;
      const limit = 10;
      const sortOrder = 'desc' as const;
      const mockPaginatedResponse: PaginatedResponse<NoteDocument> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      };
      noteService.findByLead.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getByLead(
        leadId,
        page,
        limit,
        undefined,
        undefined,
        sortOrder,
      );

      expect(noteService.findByLead).toHaveBeenCalledWith(leadId, {
        page,
        limit,
        sortOrder,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle service errors', async () => {
      const leadId = new Types.ObjectId().toHexString();
      const page = 1;
      const limit = 10;
      const sortOrder = 'desc' as const;
      const error = new Error('Service error');
      noteService.findByLead.mockRejectedValue(error);

      await expect(
        controller.getByLead(
          leadId,
          page,
          limit,
          undefined,
          undefined,
          sortOrder,
        ),
      ).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a note successfully', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const updateDto: UpdateNoteDto = {
        title: 'Updated Note',
        content: 'Updated content',
      };
      const mockNote = {
        id: noteId,
        title: 'Updated Note',
        content: 'Updated content',
        createdBy: 'user123',
        organizationId: 'org123',
        isPinned: false,
        pinnedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as NoteDocument;
      noteService.update.mockResolvedValue(mockNote);

      const result = await controller.update(noteId, updateDto);

      expect(noteService.update).toHaveBeenCalledWith(noteId, updateDto);
      expect(result).toEqual(mockNote);
    });

    it('should handle service errors', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const updateDto: UpdateNoteDto = {
        title: 'Updated Note',
        content: 'Updated content',
      };
      const error = new Error('Service error');
      noteService.update.mockRejectedValue(error);

      await expect(controller.update(noteId, updateDto)).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete a note successfully', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const userId = 'user123';
      const mockNote = {
        id: noteId,
        title: 'Test Note',
        content: 'Test content',
        createdBy: userId,
        organizationId: 'org123',
        isPinned: false,
        pinnedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as NoteDocument;
      noteService.delete.mockResolvedValue(mockNote);

      const result = await controller.delete(noteId, userId);

      expect(noteService.delete).toHaveBeenCalledWith(noteId, userId);
      expect(result).toEqual(mockNote);
    });

    it('should throw BadRequestException when userId is empty', () => {
      const noteId = new Types.ObjectId().toHexString();
      const userId = '';

      expect(() => {
        void controller.delete(noteId, userId);
      }).toThrow(BadRequestException);
      expect(noteService.delete).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const userId = 'user123';
      const error = new Error('Service error');
      noteService.delete.mockRejectedValue(error);

      await expect(controller.delete(noteId, userId)).rejects.toThrow(error);
    });
  });

  describe('togglePin', () => {
    it('should pin a note successfully', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const userId = 'user123';
      const pin = true;
      const mockNote = {
        id: noteId,
        title: 'Test Note',
        content: 'Test content',
        createdBy: userId,
        organizationId: 'org123',
        isPinned: true,
        pinnedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as NoteDocument;
      noteService.pin.mockResolvedValue(mockNote);

      const result = await controller.togglePin(noteId, pin, userId);

      expect(noteService.pin).toHaveBeenCalledWith(noteId, pin, userId);
      expect(result).toEqual(mockNote);
    });

    it('should throw BadRequestException when userId is empty', () => {
      const noteId = new Types.ObjectId().toHexString();
      const userId = '';
      const pin = true;

      expect(() => {
        void controller.togglePin(noteId, pin, userId);
      }).toThrow(BadRequestException);
      expect(noteService.pin).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const noteId = new Types.ObjectId().toHexString();
      const userId = 'user123';
      const pin = true;
      const error = new Error('Service error');
      noteService.pin.mockRejectedValue(error);

      await expect(controller.togglePin(noteId, pin, userId)).rejects.toThrow(
        error,
      );
    });
  });
});
