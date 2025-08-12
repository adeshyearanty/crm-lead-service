import { Test, TestingModule } from '@nestjs/testing';
import { NoteMediaController } from './note-media.controller';
import { NoteMediaService } from '../service/note-media.service';

describe('NoteMediaController', () => {
  let controller: NoteMediaController;
  let noteMediaService: jest.Mocked<NoteMediaService>;

  const mockNoteMediaService = {
    uploadImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteMediaController],
      providers: [
        {
          provide: NoteMediaService,
          useValue: mockNoteMediaService,
        },
      ],
    }).compile();

    controller = module.get<NoteMediaController>(NoteMediaController);
    noteMediaService = module.get(NoteMediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload an image successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test image data'),
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      };
      const mockKey = 'uploads/test-image-123.jpg';
      noteMediaService.uploadImage.mockResolvedValue(mockKey);

      const result = await controller.uploadImage(mockFile);

      expect(mockNoteMediaService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual({ success: true, key: mockKey });
    });

    it('should handle service errors', async () => {
      const mockFile = {
        buffer: Buffer.from('test image data'),
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      };
      const error = new Error('Upload failed');
      noteMediaService.uploadImage.mockRejectedValue(error);

      await expect(controller.uploadImage(mockFile)).rejects.toThrow(error);
    });

    it('should handle different file types', async () => {
      const mockFile = {
        buffer: Buffer.from('test png data'),
        originalname: 'test-image.png',
        mimetype: 'image/png',
        size: 2048,
      };
      const mockKey = 'uploads/test-image-456.png';
      noteMediaService.uploadImage.mockResolvedValue(mockKey);

      const result = await controller.uploadImage(mockFile);

      expect(mockNoteMediaService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual({ success: true, key: mockKey });
    });

    it('should handle large files', async () => {
      const mockFile = {
        buffer: Buffer.from('large image data'),
        originalname: 'large-image.jpg',
        mimetype: 'image/jpeg',
        size: 5242880, // 5MB
      };
      const mockKey = 'uploads/large-image-789.jpg';
      noteMediaService.uploadImage.mockResolvedValue(mockKey);

      const result = await controller.uploadImage(mockFile);

      expect(mockNoteMediaService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual({ success: true, key: mockKey });
    });
  });
});
