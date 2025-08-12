import { Test, TestingModule } from '@nestjs/testing';
import { LeadSourceController } from './lead-source.controller';
import { LeadSourceService } from '../service/lead-source.service';
import { CreateLeadSourceDto } from '../dto/lead-source/create-lead-source.dto';
import { UpdateLeadSourceDto } from '../dto/lead-source/update-lead-source.dto';
import { QueryLeadSourceDto } from '../dto/lead-source/query-lead-source.dto';
import { LeadSource } from '../model/lead-source.model';
import { PaginatedLeadSourceResponseDto } from '../dto/lead-source/paginated-response.dto';

describe('LeadSourceController', () => {
  let controller: LeadSourceController;
  let leadSourceService: jest.Mocked<LeadSourceService>;

  const mockLeadSourceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadSourceController],
      providers: [
        {
          provide: LeadSourceService,
          useValue: mockLeadSourceService,
        },
      ],
    }).compile();

    controller = module.get<LeadSourceController>(LeadSourceController);
    leadSourceService = module.get(LeadSourceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a lead source successfully', async () => {
      const createDto: CreateLeadSourceDto = {
        name: 'Website',
      };
      const mockResult = {
        id: '1',
        ...createDto,
        description: 'Leads from website',
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadSource;
      leadSourceService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(leadSourceService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const createDto: CreateLeadSourceDto = {
        name: 'Website',
      };
      const error = new Error('Creation failed');
      leadSourceService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should get all lead sources with pagination', async () => {
      const query: QueryLeadSourceDto = {
        page: 1,
        limit: 10,
        search: 'Website',
      };
      const mockResult: PaginatedLeadSourceResponseDto = {
        items: [
          {
            id: '1',
            name: 'Website',
            description: 'Leads from website',
            isDefault: false,
            isActive: true,
          } as unknown as LeadSource,
          {
            id: '2',
            name: 'Social Media',
            description: 'Leads from social media',
            isDefault: false,
            isActive: true,
          } as unknown as LeadSource,
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      leadSourceService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query);

      expect(leadSourceService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const query: QueryLeadSourceDto = {
        page: 1,
        limit: 10,
      };
      const error = new Error('Query failed');
      leadSourceService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(query)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should get a lead source by id', async () => {
      const id = '1';
      const mockResult = {
        id,
        name: 'Website',
        description: 'Leads from website',
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadSource;
      leadSourceService.findById.mockResolvedValue(mockResult);

      const result = await controller.findOne(id);

      expect(leadSourceService.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const error = new Error('Not found');
      leadSourceService.findById.mockRejectedValue(error);

      await expect(controller.findOne(id)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a lead source successfully', async () => {
      const id = '1';
      const updateDto: UpdateLeadSourceDto = {
        name: 'Updated Website',
      };
      const mockResult = {
        id,
        ...updateDto,
        description: 'Updated website leads',
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadSource;
      leadSourceService.update.mockResolvedValue(mockResult);

      const result = await controller.update(id, updateDto);

      expect(leadSourceService.update).toHaveBeenCalledWith({
        id,
        dto: updateDto,
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const updateDto: UpdateLeadSourceDto = {
        name: 'Updated Website',
      };
      const error = new Error('Update failed');
      leadSourceService.update.mockRejectedValue(error);

      await expect(controller.update(id, updateDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should remove a lead source successfully', async () => {
      const id = '1';
      const mockResult = {
        id,
        name: 'Deleted Source',
        description: 'Deleted source',
        isDefault: false,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadSource;
      leadSourceService.delete.mockResolvedValue(mockResult);

      const result = await controller.remove(id);

      expect(leadSourceService.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const error = new Error('Delete failed');
      leadSourceService.delete.mockRejectedValue(error);

      await expect(controller.remove(id)).rejects.toThrow(error);
    });
  });
});
