import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateViewDto } from '../dto/create-view.dto';
import { UpdateViewDto } from '../dto/update-view.dto';
import { ViewModel } from '../model/view.model';
import { ViewRepository } from '../repository/view.repository';

@Injectable()
export class ViewsService {
  private readonly logger = new Logger(ViewsService.name);

  constructor(private readonly viewRepository: ViewRepository) {}

  async create(
    userId: string,
    createViewDto: CreateViewDto,
  ): Promise<{ statusCode: number; message: string; data: ViewModel }> {
    // If this view is being set as default, remove default from other views
    if (createViewDto.isDefault) {
      await this.viewRepository.removeDefaultFromAllViews(userId);
    }

    // Ensure columnsToDisplay is properly formatted
    const viewData = {
      ...createViewDto,
      columnsToDisplay: Array.isArray(createViewDto.columnsToDisplay)
        ? createViewDto.columnsToDisplay
        : [],
      // Ensure filters is an array
      filters: Array.isArray(createViewDto.filters)
        ? createViewDto.filters
        : [],
    };

    const view = await this.viewRepository.create(userId, viewData);
    return {
      statusCode: 201,
      message: 'View created successfully',
      data: view,
    };
  }

  async findAll(
    userId: string,
  ): Promise<{ statusCode: number; message: string; data: ViewModel[] }> {
    const views = await this.viewRepository.findAll(userId);
    return {
      statusCode: 200,
      message: 'Views retrieved successfully',
      data: views,
    };
  }

  async findOne(
    userId: string,
    viewId: string,
  ): Promise<{ statusCode: number; message: string; data: ViewModel }> {
    const view = await this.viewRepository.findOne(userId, viewId);
    if (!view) {
      throw new NotFoundException('View not found');
    }
    return {
      statusCode: 200,
      message: 'View retrieved successfully',
      data: view,
    };
  }

  async findDefault(
    userId: string,
  ): Promise<{ statusCode: number; message: string; data: ViewModel }> {
    const view = await this.viewRepository.findDefault(userId);
    if (!view) {
      throw new NotFoundException('Default view not found');
    }
    return {
      statusCode: 200,
      message: 'Default view retrieved successfully',
      data: view,
    };
  }

  async update(
    userId: string,
    viewId: string,
    updateViewDto: UpdateViewDto,
  ): Promise<{ statusCode: number; message: string; data: ViewModel }> {
    const view = await this.viewRepository.findOne(userId, viewId);
    if (!view) {
      throw new NotFoundException('View not found');
    }

    // If this view is being set as default, remove default from other views
    if (updateViewDto.isDefault) {
      await this.viewRepository.removeDefaultFromAllViews(userId);
    }

    // Ensure columnsToDisplay is properly formatted
    const viewData = {
      ...updateViewDto,
      columnsToDisplay: Array.isArray(updateViewDto.columnsToDisplay)
        ? updateViewDto.columnsToDisplay
        : view.columnsToDisplay,
      // Ensure filters is an array if provided
      filters: updateViewDto.filters
        ? Array.isArray(updateViewDto.filters)
          ? updateViewDto.filters
          : []
        : view.filters,
    };

    const updatedView = await this.viewRepository.update(
      userId,
      viewId,
      viewData,
    );
    if (!updatedView) {
      throw new NotFoundException('View not found');
    }
    return {
      statusCode: 200,
      message: 'View updated successfully',
      data: updatedView,
    };
  }

  async delete(
    userId: string,
    viewId: string,
  ): Promise<{ statusCode: number; message: string; data: ViewModel }> {
    this.logger.debug('Deleting view in view service:', { userId, viewId });
    const view = await this.viewRepository.delete(userId, viewId);
    if (!view) {
      throw new NotFoundException(
        'View not found or cannot delete default view',
      );
    }
    return {
      statusCode: 200,
      message: 'View deleted successfully',
      data: view,
    };
  }
}
