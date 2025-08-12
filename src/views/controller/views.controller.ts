import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateViewDto } from '../dto/create-view.dto';
import { UpdateViewDto } from '../dto/update-view.dto';
import { ViewsService } from '../service/views.service';

@ApiTags('Views')
@Controller({
  version: '1',
  path: 'views',
})
export class ViewsController {
  private readonly logger = new Logger(ViewsController.name);

  constructor(private readonly viewsService: ViewsService) {}

  @ApiOperation({
    summary: 'Create a new custom view',
  })
  @ApiResponse({ status: 201, description: 'View created successfully' })
  @Post()
  async createView(
    @Body() createViewDto: CreateViewDto,
    @Headers('user-id') userId: string,
  ) {
    try {
      return await this.viewsService.create(userId, createViewDto);
    } catch (error) {
      this.handleError(error, 'Failed to create view');
    }
  }

  @ApiOperation({
    summary: 'Get all views for the user',
  })
  @ApiResponse({ status: 200, description: 'Returns all views' })
  @Get()
  async getViews(@Headers('user-id') userId: string) {
    try {
      return await this.viewsService.findAll(userId);
    } catch (error) {
      this.handleError(error, 'Failed to get views');
    }
  }

  @ApiOperation({
    summary: 'Get the default view',
  })
  @ApiResponse({ status: 200, description: 'Returns the default view' })
  @Get('default')
  async getDefaultView(@Headers('user-id') userId: string) {
    try {
      return await this.viewsService.findDefault(userId);
    } catch (error) {
      this.handleError(error, 'Failed to get default view');
    }
  }

  @ApiOperation({
    summary: 'Get a specific view',
  })
  @ApiResponse({ status: 200, description: 'Returns the view' })
  @Get(':id')
  async getView(
    @Param('id') viewId: string,
    @Headers('user-id') userId: string,
  ) {
    try {
      return await this.viewsService.findOne(userId, viewId);
    } catch (error) {
      this.handleError(error, 'Failed to get view');
    }
  }

  @ApiOperation({
    summary: 'Update a view',
  })
  @ApiResponse({ status: 200, description: 'View updated successfully' })
  @Put(':id')
  async updateView(
    @Param('id') viewId: string,
    @Body() updateViewDto: UpdateViewDto,
    @Headers('user-id') userId: string,
  ) {
    try {
      return await this.viewsService.update(userId, viewId, updateViewDto);
    } catch (error) {
      this.handleError(error, 'Failed to update view');
    }
  }

  @ApiOperation({
    summary: 'Delete a view',
  })
  @ApiResponse({ status: 204, description: 'View deleted successfully' })
  @Delete(':id')
  async deleteView(
    @Param('id') viewId: string,
    @Headers('user-id') userId: string,
  ) {
    try {
      this.logger.debug('Deleting view in app controller:', { userId, viewId });
      return await this.viewsService.delete(userId, viewId);
    } catch (error) {
      this.handleError(error, 'Failed to delete view');
    }
  }

  private handleError(error: any, message: string) {
    this.logger.error(message, error);
    throw error;
  }
}
