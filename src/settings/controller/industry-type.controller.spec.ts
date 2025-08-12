import { Test, TestingModule } from '@nestjs/testing';
import { IndustryTypeController } from './industry-type.controller';
import { IndustryTypeService } from '../service/industry-type.service';
import { CreateIndustryTypeDto } from '../dto/industry-type/create-industry-type.dto';
import { UpdateIndustryTypeDto } from '../dto/industry-type/update-industry-type.dto';
import { QueryIndustryTypeDto } from '../dto/industry-type/query-industry-type.dto';
import { IndustryType } from '../model/industry-type.model';
import { PaginatedIndustryTypeResponseDto } from '../dto/industry-type/paginated-response.dto';

describe('IndustryTypeController', () => {
  let controller: IndustryTypeController;
  let industryTypeService: jest.Mocked<IndustryTypeService>;

  const mockIndustryTypeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndustryTypeController],
      providers: [
        {
          provide: IndustryTypeService,
          useValue: mockIndustryTypeService,
        },
      ],
    }).compile();

    controller = module.get<IndustryTypeController>(IndustryTypeController);
    industryTypeService = module.get(IndustryTypeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an industry type successfully', async () => {
      const createDto: CreateIndustryTypeDto = {
        name: 'Technology',
      };
      const mockResult = {
        id: '1',
        ...createDto,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IndustryType;
      industryTypeService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(industryTypeService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const createDto: CreateIndustryTypeDto = {
        name: 'Technology',
      };
      const error = new Error('Creation failed');
      industryTypeService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should get all industry types with pagination', async () => {
      const query: QueryIndustryTypeDto = {
        page: 1,
        limit: 10,
        search: 'Technology',
      };
      const mockResult: PaginatedIndustryTypeResponseDto = {
        items: [
          {
            id: '1',
            name: 'Technology',
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as unknown as IndustryType,
          {
            id: '2',
            name: 'Healthcare',
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as unknown as IndustryType,
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      industryTypeService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query);

      expect(industryTypeService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const query: QueryIndustryTypeDto = {
        page: 1,
        limit: 10,
      };
      const error = new Error('Query failed');
      industryTypeService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(query)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should get an industry type by id', async () => {
      const id = '1';
      const mockResult = {
        id,
        name: 'Technology',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IndustryType;
      industryTypeService.findById.mockResolvedValue(mockResult);

      const result = await controller.findOne(id);

      expect(industryTypeService.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const error = new Error('Not found');
      industryTypeService.findById.mockRejectedValue(error);

      await expect(controller.findOne(id)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update an industry type successfully', async () => {
      const id = '1';
      const updateDto: UpdateIndustryTypeDto = {
        name: 'Updated Technology',
      };
      const mockResult = {
        id,
        ...updateDto,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IndustryType;
      industryTypeService.update.mockResolvedValue(mockResult);

      const result = await controller.update(id, updateDto);

      expect(industryTypeService.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const updateDto: UpdateIndustryTypeDto = {
        name: 'Updated Technology',
      };
      const error = new Error('Update failed');
      industryTypeService.update.mockRejectedValue(error);

      await expect(controller.update(id, updateDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should remove an industry type successfully', async () => {
      const id = '1';
      const mockResult = {
        id,
        name: 'Deleted Type',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as IndustryType;
      industryTypeService.delete.mockResolvedValue(mockResult);

      const result = await controller.remove(id);

      expect(industryTypeService.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const error = new Error('Delete failed');
      industryTypeService.delete.mockRejectedValue(error);

      await expect(controller.remove(id)).rejects.toThrow(error);
    });
  });
});
