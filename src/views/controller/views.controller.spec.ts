import { Test, TestingModule } from '@nestjs/testing';
import { SortOrder } from 'src/leads/dto/pagination.dto';
import { FilterConditionDto } from '../../leads/dto/advanced-filters.dto';
import { CreateViewDto } from '../dto/create-view.dto';
import { UpdateViewDto } from '../dto/update-view.dto';
import { ViewModel } from '../model/view.model';
import { ViewsService } from '../service/views.service';
import { ViewsController } from './views.controller';

describe('ViewsController', () => {
  let controller: ViewsController;
  let viewsService: jest.Mocked<ViewsService>;

  const mockViewsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findDefault: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewsController],
      providers: [
        {
          provide: ViewsService,
          useValue: mockViewsService,
        },
      ],
    }).compile();

    controller = module.get<ViewsController>(ViewsController);
    viewsService = module.get(ViewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createView', () => {
    it('should create a view successfully', async () => {
      const userId = 'user123';
      const createViewDto: CreateViewDto = {
        name: 'My Custom View',
        filters: [
          {
            field: 'status',
            condition: 'equals',
            values: ['active'],
          } as FilterConditionDto,
        ],
        sortBy: 'createdAt',
        sortOrder: SortOrder.DESC,
      };
      const mockResult = {
        id: 'view123',
        userId,
        ...createViewDto,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ViewModel;
      mockViewsService.create.mockResolvedValue(mockResult);

      const result = await controller.createView(createViewDto, userId);

      expect(mockViewsService.create).toHaveBeenCalledWith(
        userId,
        createViewDto,
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const userId = 'user123';
      const createViewDto: CreateViewDto = {
        name: 'My Custom View',
        filters: [
          {
            field: 'status',
            condition: 'equals',
            values: ['active'],
          } as FilterConditionDto,
        ],
      };
      const error = new Error('Creation failed');
      mockViewsService.create.mockRejectedValue(error);

      await expect(
        controller.createView(createViewDto, userId),
      ).rejects.toThrow(error);
    });
  });

  describe('getViews', () => {
    it('should get all views for a user', async () => {
      const userId = 'user123';
      const mockResult = [
        {
          id: 'view1',
          userId,
          name: 'View 1',
          filters: [
            {
              field: 'status',
              condition: 'equals',
              values: ['active'],
            } as FilterConditionDto,
          ],
          isDefault: false,
        },
        {
          id: 'view2',
          userId,
          name: 'View 2',
          filters: [
            {
              field: 'status',
              condition: 'equals',
              values: ['inactive'],
            } as FilterConditionDto,
          ],
          isDefault: true,
        },
      ] as ViewModel[];
      mockViewsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.getViews(userId);

      expect(mockViewsService.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const userId = 'user123';
      const error = new Error('Find failed');
      viewsService.findAll.mockRejectedValue(error);

      await expect(controller.getViews(userId)).rejects.toThrow(error);
    });
  });

  describe('getDefaultView', () => {
    it('should get the default view for a user', async () => {
      const userId = 'user123';
      const mockResult = {
        id: 'view123',
        userId,
        name: 'Default View',
        filters: [
          {
            field: 'status',
            condition: 'equals',
            values: ['active'],
          } as FilterConditionDto,
        ],
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ViewModel;
      mockViewsService.findDefault.mockResolvedValue(mockResult);

      const result = await controller.getDefaultView(userId);

      expect(mockViewsService.findDefault).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const userId = 'user123';
      const error = new Error('Get default failed');
      viewsService.findDefault.mockRejectedValue(error);

      await expect(controller.getDefaultView(userId)).rejects.toThrow(error);
    });
  });

  describe('getView', () => {
    it('should get a specific view by ID', async () => {
      const viewId = 'view123';
      const userId = 'user123';
      const mockResult = {
        id: viewId,
        userId,
        name: 'Custom View',
        filters: [
          {
            field: 'status',
            condition: 'equals',
            values: ['active'],
          } as FilterConditionDto,
        ],
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ViewModel;
      mockViewsService.findOne.mockResolvedValue(mockResult);

      const result = await controller.getView(viewId, userId);

      expect(mockViewsService.findOne).toHaveBeenCalledWith(userId, viewId);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const viewId = 'view123';
      const userId = 'user123';
      const error = new Error('View not found');
      viewsService.findOne.mockRejectedValue(error);

      await expect(controller.getView(viewId, userId)).rejects.toThrow(error);
    });
  });

  describe('updateView', () => {
    it('should update a view successfully', async () => {
      const viewId = 'view123';
      const userId = 'user123';
      const updateViewDto: UpdateViewDto = {
        name: 'Updated View',
        filters: [
          {
            field: 'status',
            condition: 'equals',
            values: ['inactive'],
          } as FilterConditionDto,
        ],
        sortBy: 'updatedAt',
        sortOrder: SortOrder.ASC,
      };
      const mockResult = {
        id: viewId,
        userId,
        ...updateViewDto,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ViewModel;
      mockViewsService.update.mockResolvedValue(mockResult);

      const result = await controller.updateView(viewId, updateViewDto, userId);

      expect(mockViewsService.update).toHaveBeenCalledWith(
        userId,
        viewId,
        updateViewDto,
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const viewId = 'view123';
      const userId = 'user123';
      const updateViewDto: UpdateViewDto = {
        name: 'Updated View',
        filters: [
          {
            field: 'status',
            condition: 'equals',
            values: ['inactive'],
          } as FilterConditionDto,
        ],
      };
      const error = new Error('Update failed');
      viewsService.update.mockRejectedValue(error);

      await expect(
        controller.updateView(viewId, updateViewDto, userId),
      ).rejects.toThrow(error);
    });
  });

  describe('deleteView', () => {
    it('should delete a view successfully', async () => {
      const viewId = 'view123';
      const userId = 'user123';
      const mockResult = {
        id: viewId,
        userId,
        name: 'Deleted View',
        filters: [
          {
            field: 'status',
            condition: 'equals',
            values: ['active'],
          } as FilterConditionDto,
        ],
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ViewModel;
      mockViewsService.delete.mockResolvedValue(mockResult);

      const result = await controller.deleteView(viewId, userId);

      expect(mockViewsService.delete).toHaveBeenCalledWith(userId, viewId);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const viewId = 'view123';
      const userId = 'user123';
      const error = new Error('Delete failed');
      viewsService.delete.mockRejectedValue(error);

      await expect(controller.deleteView(viewId, userId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('handleError', () => {
    it('should rethrow the error', () => {
      const error = new Error('Test error');
      expect(() => controller['handleError'](error, 'Test message')).toThrow(
        error,
      );
    });
  });
});
