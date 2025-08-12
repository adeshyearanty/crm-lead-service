import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError } from 'axios';
import { Response } from 'express';
import {
  AdvancedLeadFiltersDto,
  FilterCondition,
} from '../dto/advanced-filters.dto';
import { BulkOperationDto, BulkUpdateDto } from '../dto/bulk-operations.dto';
import { CreateLeadDto } from '../dto/create-leads.dto';
import { QueryLeadDto } from '../dto/query-leads.dto';
import { SortOrder } from '../dto/pagination.dto';
import { UpdateLeadDto } from '../dto/update-leads.dto';
import { LeadDocument } from '../model/leads.model';
import { LeadService } from '../service/leads.service';
import { LeadController } from './leads.controller';

describe('LeadController', () => {
  let controller: LeadController;
  let leadService: jest.Mocked<LeadService>;

  const mockLeadService = {
    createLead: jest.fn(),
    getLeadById: jest.fn(),
    updateLead: jest.fn(),
    deleteLead: jest.fn(),
    bulkDelete: jest.fn(),
    bulkUpdate: jest.fn(),
    exportSelectedToCsv: jest.fn(),
    exportLeadsAdvanced: jest.fn(),
    archiveLeads: jest.fn(),
    findAllAdvanced: jest.fn(),
  } as const;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadController],
      providers: [
        {
          provide: LeadService,
          useValue: mockLeadService,
        },
      ],
    }).compile();

    controller = module.get<LeadController>(LeadController);
    leadService = module.get(LeadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a lead successfully', async () => {
      const createLeadDto: CreateLeadDto = {
        leadOwner: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        companyName: 'Test Company',
        designation: 'Manager',
        source: 'Website',
        status: 'New',
        description: 'Test notes',
        createdBy: 'user123',
        createdDate: new Date(),
      };
      const mockLead = {
        _id: '1',
        ...createLeadDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadDocument;
      leadService.createLead.mockResolvedValue({
        statusCode: 201,
        message: 'Lead created successfully',
        data: mockLead,
      });

      const result = await controller.createLead(createLeadDto);

      expect(leadService.createLead).toHaveBeenCalledWith(createLeadDto);
      expect(result).toEqual({
        statusCode: 201,
        message: 'Lead created successfully',
        data: mockLead,
      });
    });

    it('should handle service errors', async () => {
      const createLeadDto: CreateLeadDto = {
        leadOwner: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        companyName: 'Test Company',
        designation: 'Manager',
        source: 'Website',
        status: 'New',
        description: 'Test notes',
        createdBy: 'user123',
        createdDate: new Date(),
      };
      const error = new Error('Service error');
      leadService.createLead.mockRejectedValue(error);

      await expect(controller.createLead(createLeadDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should get all leads with pagination', async () => {
      const query: QueryLeadDto = {
        page: 1,
        limit: 10,
        search: 'John',
        sortBy: 'createdAt',
        sortOrder: SortOrder.DESC,
      };
      const mockLeads = [
        {
          _id: '1',
          leadOwner: 'user123',
          fullName: 'John Doe',
          email: 'john@example.com',
          companyName: 'Test Company',
          source: 'Website',
          status: 'New',
          createdBy: 'user123',
          createdDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as unknown as LeadDocument[];
      const mockPaginatedResponse = {
        data: mockLeads,
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      leadService.findAllAdvanced.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getLeadsAdvanced(query, { filters: [] });

      expect(leadService.findAllAdvanced).toHaveBeenCalledWith({
        ...query,
        filters: [],
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should get a lead by id', async () => {
      const id = '1';
      const mockLead = {
        _id: id,
        leadOwner: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        companyName: 'Test Company',
        source: 'Website',
        status: 'New',
        createdBy: 'user123',
        createdDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadDocument;
      leadService.getLeadById.mockResolvedValue(mockLead);

      const result = await controller.getLeadById(id);

      expect(leadService.getLeadById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockLead);
    });
  });

  describe('update', () => {
    it('should update a lead successfully', async () => {
      const id = '1';
      const updateLeadDto: UpdateLeadDto = {
        email: 'john.updated@example.com',
        fullName: 'John Updated',
        updatedBy: 'user123',
      };
      const mockLead = {
        _id: id,
        ...updateLeadDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadDocument;
      leadService.updateLead.mockResolvedValue(mockLead);

      const result = await controller.updateLead(id, updateLeadDto);

      expect(leadService.updateLead).toHaveBeenCalledWith(
        id,
        updateLeadDto,
        undefined,
      );
      expect(result).toEqual(mockLead);
    });
  });

  describe('remove', () => {
    it('should remove a lead successfully', async () => {
      const id = '1';
      const mockLead = {
        _id: id,
        companyName: 'Test Company',
        fullName: 'John Doe',
        email: 'john@example.com',
        designation: 'Manager',
        source: 'Website',
        status: 'New',
        leadOwner: 'user123',
        createdBy: 'user123',
        createdDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as LeadDocument;
      leadService.deleteLead.mockResolvedValue({
        statusCode: 200,
        message: 'Lead deleted successfully',
        data: mockLead,
      });

      const result = await controller.deleteLead(id, 'user123');

      expect(leadService.deleteLead).toHaveBeenCalledWith(id, 'user123');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Lead deleted successfully',
        data: mockLead,
      });
    });
  });

  describe('exportSelectedLeads', () => {
    it('should export selected leads to CSV', async () => {
      const leadIds = ['1', '2', '3'];
      const query: QueryLeadDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: SortOrder.DESC,
      };
      const csvContent =
        'name,email,company\nJohn Doe,john@example.com,Test Company';
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      leadService.exportSelectedToCsv.mockResolvedValue(csvContent);

      await controller.exportSelectedLeads({ leadIds }, query, mockResponse);

      expect(mockLeadService.exportSelectedToCsv).toHaveBeenCalledWith(
        leadIds,
        query,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=selected-leads.csv',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(csvContent);
    });

    it('should handle export errors', async () => {
      const leadIds = ['1', '2', '3'];
      const query: QueryLeadDto = { page: 1, limit: 10 };
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      const error = new Error('Export failed');
      leadService.exportSelectedToCsv.mockRejectedValue(error);

      await expect(
        controller.exportSelectedLeads({ leadIds }, query, mockResponse),
      ).rejects.toThrow(error);
    });
  });

  describe('exportLeadsAdvanced', () => {
    it('should export leads with advanced filters to CSV', async () => {
      const query: QueryLeadDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: SortOrder.DESC,
      };
      const filters: AdvancedLeadFiltersDto = {
        filters: [
          {
            field: 'status',
            condition: FilterCondition.EQUALS,
            value: 1,
          },
        ],
      };
      const csvContent =
        'name,email,company\nJohn Doe,john@example.com,Test Company';
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      leadService.exportLeadsAdvanced.mockResolvedValue(csvContent);

      await controller.exportLeadsAdvanced(query, filters, mockResponse);

      expect(leadService.exportLeadsAdvanced).toHaveBeenCalledWith({
        ...query,
        filters: filters.filters,
      });
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=leads-advanced.csv',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(csvContent);
    });

    it('should handle advanced export errors', async () => {
      const filters: AdvancedLeadFiltersDto = {
        filters: [
          {
            field: 'status',
            condition: FilterCondition.EQUALS,
            value: 1,
          },
        ],
      };
      const query: QueryLeadDto = { page: 1, limit: 10 };
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      const error = new Error('Export failed');
      leadService.exportLeadsAdvanced.mockRejectedValue(error);

      await expect(
        controller.exportLeadsAdvanced(query, filters, mockResponse),
      ).rejects.toThrow(error);
    });
  });

  describe('archive', () => {
    it('should archive a lead successfully', async () => {
      const id = '1';
      leadService.archiveLeads.mockResolvedValue({ modifiedCount: 1 });

      const result = await controller.archiveLeads({
        leadIds: [id],
        archive: true,
      });

      expect(leadService.archiveLeads).toHaveBeenCalledWith({
        leadIds: [id],
        archive: true,
      });
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('unarchive', () => {
    it('should unarchive a lead successfully', async () => {
      const id = '1';
      leadService.archiveLeads.mockResolvedValue({ modifiedCount: 1 });

      const result = await controller.archiveLeads({
        leadIds: [id],
        archive: false,
      });

      expect(leadService.archiveLeads).toHaveBeenCalledWith({
        leadIds: [id],
        archive: false,
      });
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('findAdvanced', () => {
    it('should find leads with advanced filters', async () => {
      const filters: AdvancedLeadFiltersDto = {
        filters: [
          {
            field: 'status',
            condition: FilterCondition.EQUALS,
            values: ['New', 'In Progress'],
          },
        ],
      };
      const query: QueryLeadDto = { page: 1, limit: 10 };
      const mockLeads = [
        {
          _id: '1',
          leadOwner: 'user123',
          fullName: 'John Doe',
          email: 'john@example.com',
          companyName: 'Test Company',
          source: 'Website',
          status: 'New',
          createdBy: 'user123',
          createdDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as unknown as LeadDocument[];
      const mockPaginatedResponse = {
        data: mockLeads,
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      leadService.findAllAdvanced.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getLeadsAdvanced(query, filters);

      expect(leadService.findAllAdvanced).toHaveBeenCalledWith({
        ...query,
        filters: filters.filters,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('bulkDeleteLeads', () => {
    it('should bulk delete leads successfully', async () => {
      const bulkOperationDto: BulkOperationDto = {
        leadIds: ['1', '2', '3'],
        deletedBy: 'user123',
      };
      const mockResult = { deletedCount: 3 };
      leadService.bulkDelete.mockResolvedValue(mockResult);

      const result = await controller.bulkDeleteLeads(bulkOperationDto);

      expect(leadService.bulkDelete).toHaveBeenCalledWith(bulkOperationDto);
      expect(result).toEqual({ success: true, deletedCount: 3 });
    });
  });

  describe('bulkUpdateLeads', () => {
    it('should bulk update leads successfully', async () => {
      const bulkUpdateDto: BulkUpdateDto = {
        leadIds: ['1', '2'],
        leadOwner: 'Updated Name',
        updatedBy: 'user123',
      };
      const mockResult = { modifiedCount: 2 };
      leadService.bulkUpdate.mockResolvedValue(mockResult);

      const result = await controller.bulkUpdateLeads(bulkUpdateDto);

      expect(leadService.bulkUpdate).toHaveBeenCalledWith({
        leadIds: bulkUpdateDto.leadIds,
        updates: {
          leadOwner: bulkUpdateDto.leadOwner,
          updatedBy: bulkUpdateDto.updatedBy,
        },
        updatedBy: bulkUpdateDto.updatedBy,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('handleError', () => {
    it('should handle HttpException', () => {
      const error = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      expect(() => controller['handleError'](error, 'Test message')).toThrow(
        HttpException,
      );
    });

    it('should handle AxiosError', () => {
      const error = new AxiosError('Network error', 'NETWORK_ERROR');
      expect(() => controller['handleError'](error, 'Test message')).toThrow(
        HttpException,
      );
    });

    it('should rethrow the error', () => {
      const error = new Error('Test error');
      expect(() => controller['handleError'](error, 'Test message')).toThrow(
        error,
      );
    });
  });
});
