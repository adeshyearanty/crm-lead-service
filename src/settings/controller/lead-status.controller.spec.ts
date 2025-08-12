import { Test, TestingModule } from '@nestjs/testing';
import { LeadStatusController } from './lead-status.controller';
import { LeadStatusService } from '../service/lead-status.service';
import { CreateLeadStatusDto } from '../dto/lead-status/create-lead-status.dto';
import { UpdateLeadStatusDto } from '../dto/lead-status/update-lead-status.dto';
import { QueryLeadStatusDto } from '../dto/lead-status/query-lead-status.dto';
import { LeadStatus } from '../model/lead-status.model';
import { PaginatedLeadStatusResponseDto } from '../dto/lead-status/paginated-response.dto';

describe('LeadStatusController', () => {
  let controller: LeadStatusController;
  let leadStatusService: jest.Mocked<LeadStatusService>;

  const mockLeadStatusService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadStatusController],
      providers: [
        {
          provide: LeadStatusService,
          useValue: mockLeadStatusService,
        },
      ],
    }).compile();

    controller = module.get<LeadStatusController>(LeadStatusController);
    leadStatusService = module.get(LeadStatusService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a lead status successfully', async () => {
      const createDto: CreateLeadStatusDto = {
        name: 'New Lead',
      };
      const mockResult = {
        id: '1',
        ...createDto,
        description: 'New lead status',
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadStatus;
      leadStatusService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(leadStatusService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const createDto: CreateLeadStatusDto = {
        name: 'New Lead',
      };
      const error = new Error('Creation failed');
      leadStatusService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should get all lead statuses with pagination', async () => {
      const query: QueryLeadStatusDto = {
        page: 1,
        limit: 10,
        search: 'New',
      };
      const mockResult: PaginatedLeadStatusResponseDto = {
        items: [
          {
            id: '1',
            name: 'New Lead',
            description: 'New lead status',
            isDefault: false,
            isActive: true,
          } as unknown as LeadStatus,
          {
            id: '2',
            name: 'In Progress',
            description: 'In progress status',
            isDefault: false,
            isActive: true,
          } as unknown as LeadStatus,
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      leadStatusService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query);

      expect(leadStatusService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const query: QueryLeadStatusDto = {
        page: 1,
        limit: 10,
      };
      const error = new Error('Query failed');
      leadStatusService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(query)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should get a lead status by id', async () => {
      const id = '1';
      const mockResult = {
        id,
        name: 'New Lead',
        description: 'New lead status',
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadStatus;
      leadStatusService.findById.mockResolvedValue(mockResult);

      const result = await controller.findOne(id);

      expect(leadStatusService.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const error = new Error('Not found');
      leadStatusService.findById.mockRejectedValue(error);

      await expect(controller.findOne(id)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a lead status successfully', async () => {
      const id = '1';
      const updateDto: UpdateLeadStatusDto = {
        name: 'Updated Lead',
      };
      const mockResult = {
        id,
        ...updateDto,
        description: 'Updated lead status',
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadStatus;
      leadStatusService.update.mockResolvedValue(mockResult);

      const result = await controller.update(id, updateDto);

      expect(leadStatusService.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const updateDto: UpdateLeadStatusDto = {
        name: 'Updated Lead',
      };
      const error = new Error('Update failed');
      leadStatusService.update.mockRejectedValue(error);

      await expect(controller.update(id, updateDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should remove a lead status successfully', async () => {
      const id = '1';
      const mockResult = {
        id,
        name: 'Deleted Lead',
        description: 'Deleted lead status',
        isDefault: false,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadStatus;
      leadStatusService.delete.mockResolvedValue(mockResult);

      const result = await controller.remove(id);

      expect(leadStatusService.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const error = new Error('Delete failed');
      leadStatusService.delete.mockRejectedValue(error);

      await expect(controller.remove(id)).rejects.toThrow(error);
    });
  });
});
