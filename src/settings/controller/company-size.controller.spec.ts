import { Test, TestingModule } from '@nestjs/testing';
import { CompanySizeController } from './company-size.controller';
import { CompanySizeService } from '../service/company-size.service';
import { CreateCompanySizeDto } from '../dto/company-size/create-company-size.dto';
import { UpdateCompanySizeDto } from '../dto/company-size/update-company-size.dto';
import { QueryCompanySizeDto } from '../dto/company-size/query-company-size.dto';
import { CompanySize } from '../model/company-size.model';
import { PaginatedCompanySizeResponseDto } from '../dto/company-size/paginated-response.dto';

describe('CompanySizeController', () => {
  let controller: CompanySizeController;
  let companySizeService: jest.Mocked<CompanySizeService>;

  const mockCompanySizeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanySizeController],
      providers: [
        {
          provide: CompanySizeService,
          useValue: mockCompanySizeService,
        },
      ],
    }).compile();

    controller = module.get<CompanySizeController>(CompanySizeController);
    companySizeService = module.get(CompanySizeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a company size successfully', async () => {
      const createDto: CreateCompanySizeDto = {
        label: '1-10 employees',
        employeeRange: '1-10',
      };
      const mockResult = {
        id: '1',
        ...createDto,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as CompanySize;
      companySizeService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(companySizeService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const createDto: CreateCompanySizeDto = {
        label: '1-10 employees',
        employeeRange: '1-10',
      };
      const error = new Error('Creation failed');
      companySizeService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should get all company sizes with pagination', async () => {
      const query: QueryCompanySizeDto = {
        page: 1,
        limit: 10,
        search: 'Small',
      };
      const mockResult: PaginatedCompanySizeResponseDto = {
        items: [
          {
            id: '1',
            label: '1-10 employees',
            employeeRange: '1-10',
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as unknown as CompanySize,
          {
            id: '2',
            label: '11-50 employees',
            employeeRange: '11-50',
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as unknown as CompanySize,
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      companySizeService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query);

      expect(companySizeService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const query: QueryCompanySizeDto = {
        page: 1,
        limit: 10,
      };
      const error = new Error('Query failed');
      companySizeService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(query)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should get a company size by id', async () => {
      const id = '1';
      const mockResult = {
        id,
        label: '1-10 employees',
        employeeRange: '1-10',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as CompanySize;
      companySizeService.findById.mockResolvedValue(mockResult);

      const result = await controller.findOne(id);

      expect(companySizeService.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const error = new Error('Not found');
      companySizeService.findById.mockRejectedValue(error);

      await expect(controller.findOne(id)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a company size successfully', async () => {
      const id = '1';
      const updateDto: UpdateCompanySizeDto = {
        label: 'Updated 1-10',
        employeeRange: '1-10',
      };
      const mockResult = {
        id,
        ...updateDto,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as CompanySize;
      companySizeService.update.mockResolvedValue(mockResult);

      const result = await controller.update(id, updateDto);

      expect(companySizeService.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const updateDto: UpdateCompanySizeDto = {
        label: 'Updated 1-10',
        employeeRange: '1-10',
      };
      const error = new Error('Update failed');
      companySizeService.update.mockRejectedValue(error);

      await expect(controller.update(id, updateDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should remove a company size successfully', async () => {
      const id = '1';
      const mockResult = {
        id,
        label: 'Deleted Size',
        employeeRange: '1-10',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as CompanySize;
      companySizeService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(id);

      expect(companySizeService.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const id = '1';
      const error = new Error('Delete failed');
      companySizeService.remove.mockRejectedValue(error);

      await expect(controller.remove(id)).rejects.toThrow(error);
    });
  });
});
