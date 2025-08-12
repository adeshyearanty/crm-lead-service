import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AxiosError } from 'axios';
import { Response } from 'express';

import { AdvancedLeadFiltersDto } from '../dto/advanced-filters.dto';
import { BulkOperationDto, BulkUpdateDto } from '../dto/bulk-operations.dto';
import { CreateLeadDto } from '../dto/create-leads.dto';
import { QueryLeadDto } from '../dto/query-leads.dto';
import { UpdateLeadDto } from '../dto/update-leads.dto';
import { LeadService } from '../service/leads.service';

// Define proper file type interface matching service expectations
interface ServiceFileType {
  buffer: string;
  originalname: string;
  mimetype: string;
  size: number;
}

// Multer file type
interface MulterFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Helper function to convert Multer file to service file format
function convertMulterFile(file: MulterFileType): ServiceFileType {
  return {
    buffer: file.buffer.toString('base64'),
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
}

@ApiTags('Leads')
@Controller({
  version: '1',
  path: 'leads',
})
export class LeadController {
  private readonly logger = new Logger(LeadController.name);

  constructor(private readonly leadService: LeadService) {}

  private handleError(error: unknown, defaultMessage: string) {
    this.logger.error(defaultMessage, error);

    // If it's already an HttpException, rethrow it
    if (error instanceof HttpException) {
      throw error;
    }

    // Handle AxiosError specifically
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError;

      // Handle microservice specific error format
      if (
        axiosError?.response?.data &&
        typeof axiosError.response.data === 'object' &&
        'error' in axiosError.response.data
      ) {
        const errorData = axiosError.response.data as {
          error?: string;
          statusCode?: number;
        };
        throw new HttpException(
          axiosError.message || errorData.error || defaultMessage,
          errorData.statusCode ||
            axiosError.status ||
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Handle other AxiosError types
      throw new HttpException(
        axiosError.message || defaultMessage,
        axiosError.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Handle other error types
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new HttpException(
      errorMessage || defaultMessage,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Returns a lead' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @Get(':id')
  async getLeadById(@Param('id') id: string) {
    try {
      return await this.leadService.getLeadById(id);
    } catch (error) {
      this.handleError(error, `Failed to get lead ${id}`);
    }
  }

  @ApiOperation({ summary: 'Create a new lead' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLeadDto })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Post()
  @UseInterceptors(FileInterceptor('leadImage'))
  async createLead(
    @Body() createLeadDto: CreateLeadDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: MulterFileType,
  ) {
    try {
      const result = await this.leadService.createLead({
        ...createLeadDto,
        file: file ? convertMulterFile(file) : undefined,
      });
      this.logger.debug('Lead created successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error in createLead:');
      this.handleError(error, 'Failed to create lead');
    }
  }

  @ApiOperation({ summary: 'Update a lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateLeadDto })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @Put(':id')
  @UseInterceptors(FileInterceptor('leadImage'))
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: MulterFileType,
  ) {
    try {
      const result = await this.leadService.updateLead(
        id,
        updateLeadDto,
        file ? convertMulterFile(file) : undefined,
      );
      this.logger.debug('Lead updated successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error in updateLead:', error);
      this.handleError(error, `Failed to update lead ${id}`);
    }
  }

  @ApiOperation({ summary: 'Delete a lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        deletedBy: { type: 'string', example: 'adeshyearanty' },
      },
      required: ['deletedBy'],
    },
  })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @Delete(':id')
  async deleteLead(
    @Param('id') id: string,
    @Body('deletedBy') deletedBy: string,
  ) {
    try {
      return await this.leadService.deleteLead(id, deletedBy);
    } catch (error) {
      this.handleError(error, `Failed to delete lead ${id}`);
    }
  }

  @ApiOperation({ summary: 'Bulk delete leads' })
  @ApiResponse({ status: 200, description: 'Leads deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or some leads do not exist',
  })
  @Post('bulk-delete')
  async bulkDeleteLeads(@Body() bulkOperationDto: BulkOperationDto) {
    try {
      this.logger.debug('Bulk deleting leads:', bulkOperationDto);
      const result = await this.leadService.bulkDelete(bulkOperationDto);
      return { success: true, deletedCount: result.deletedCount };
    } catch (error: any) {
      this.logger.error('Error in bulk delete:', error);
      this.handleError(error, 'Failed to delete leads');
    }
  }

  @ApiOperation({ summary: 'Export selected leads to CSV' })
  @ApiResponse({
    status: 200,
    description: 'Returns a CSV file containing selected leads',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('export-selected')
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportSelectedLeads(
    @Body() body: { leadIds: string[] },
    @Query() query: QueryLeadDto,
    @Res() res: Response,
  ) {
    try {
      this.logger.debug(
        'Exporting selected leads to CSV:',
        body.leadIds,
        'with query:',
        query,
      );
      const csvContent = await this.leadService.exportSelectedToCsv(
        body.leadIds,
        query,
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=selected-leads.csv',
      );
      res.send(csvContent);
    } catch (error) {
      this.handleError(error, 'Failed to export leads');
    }
  }

  @ApiOperation({ summary: 'Bulk update leads' })
  @ApiResponse({ status: 200, description: 'Leads updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or some leads do not exist',
  })
  @Post('bulk-update')
  async bulkUpdateLeads(@Body() bulkUpdateDto: BulkUpdateDto) {
    try {
      const { leadIds, ...updates } = bulkUpdateDto;
      this.logger.debug('Bulk updating leads:', { leadIds, updates });
      return await this.leadService.bulkUpdate({
        leadIds,
        updates,
        updatedBy: bulkUpdateDto.updatedBy as string,
      });
    } catch (error) {
      this.logger.error('Error in bulk update:', error);
      this.handleError(error, 'Failed to update leads');
    }
  }

  @ApiOperation({ summary: 'Archive or unarchive leads' })
  @ApiResponse({
    status: 200,
    description: 'Leads archived/unarchived successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or some leads do not exist',
  })
  @Post('archive')
  async archiveLeads(@Body() data: { leadIds: string[]; archive?: boolean }) {
    try {
      this.logger.debug('Archiving/unarchiving leads:', data);
      return await this.leadService.archiveLeads(data);
    } catch (error) {
      this.logger.error('Error in archive:', error);
      this.handleError(error, 'Failed to archive leads');
    }
  }

  @ApiOperation({
    summary: 'Get leads with advanced filtering',
    description:
      'Get leads using advanced filtering options while maintaining existing query parameters',
  })
  @ApiBody({ type: AdvancedLeadFiltersDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated leads based on advanced filters',
  })
  @Post('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLeadsAdvanced(
    @Query() query: QueryLeadDto,
    @Body() advancedFilters: AdvancedLeadFiltersDto,
  ) {
    try {
      this.logger.debug('Query params:', query);
      this.logger.debug('Advanced filters:', advancedFilters);
      return await this.leadService.findAllAdvanced({
        ...query,
        filters: advancedFilters.filters,
      });
    } catch (error) {
      this.handleError(error, 'Failed to get leads with advanced filters');
    }
  }

  @ApiOperation({
    summary: 'Export leads with advanced filtering',
    description:
      'Export leads to CSV using advanced filtering options while maintaining existing query parameters',
  })
  @ApiBody({ type: AdvancedLeadFiltersDto })
  @ApiResponse({
    status: 200,
    description: 'Returns a CSV file containing filtered leads',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('export/advanced')
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportLeadsAdvanced(
    @Query() query: QueryLeadDto,
    @Body() advancedFilters: AdvancedLeadFiltersDto,
    @Res() res: Response,
  ) {
    try {
      this.logger.debug('Query params:', query);
      this.logger.debug('Advanced filters:', advancedFilters);

      const csvContent = await this.leadService.exportLeadsAdvanced({
        ...query,
        filters: advancedFilters.filters,
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=leads-advanced.csv',
      );
      res.send(csvContent);
    } catch (error) {
      this.handleError(error, 'Failed to export leads with advanced filters');
    }
  }

  // @ApiOperation({ summary: 'Get lead activities' })
  // @ApiParam({ name: 'id', description: 'Lead ID' })
  // @ApiResponse({ status: 200, description: 'Returns lead activities' })
  // @Get(':id/activities')
  // async getLeadTimeline(@Param('id') id: string) {
  //   return await this.activityClientService.fetchActivities({
  //     leadId: id,
  //   });
  // }

  // @Get('tasks/:leadId')
  // @ApiOperation({ summary: 'Get tasks by lead ID with pagination' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns paginated tasks for a lead with metadata',
  // })
  // @ApiQuery({ name: 'page', required: false, type: Number })
  // @ApiQuery({ name: 'limit', required: false, type: Number })
  // @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  // @ApiQuery({
  //   name: 'sortBy',
  //   required: false,
  //   type: String,
  //   default: 'dueDate',
  // })
  // @ApiQuery({
  //   name: 'sortOrder',
  //   required: false,
  //   enum: SortOrder,
  //   default: SortOrder.DESC,
  // })
  // @ApiQuery({
  //   name: 'search',
  //   required: false,
  //   type: String,
  //   description: 'Search term to filter tasks',
  // })
  // findByLeadId(
  //   @Param('leadId') leadId: string,
  //   @Query('page') page?: number,
  //   @Query('limit') limit?: number,
  //   @Query('status') status?: TaskStatus,
  //   @Query('sortBy') sortBy: string = 'dueDate',
  //   @Query('sortOrder') sortOrder: SortOrder = SortOrder.DESC,
  //   @Query('search') search?: string,
  // ) {
  //   return this.taskClientService.findByLeadId(
  //     {
  //       leadId,
  //       page,
  //       limit,
  //       status,
  //       sortBy,
  //       sortOrder,
  //       search,
  //     },
  //   );
  // }
}
