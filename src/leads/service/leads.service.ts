import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { FilterConditionDto } from '../dto/advanced-filters.dto';
import { BulkOperationDto } from '../dto/bulk-operations.dto';
import { CreateLeadDto } from '../dto/create-leads.dto';
import { PaginatedResponse, SortOrder } from '../dto/pagination.dto';
import { QueryLeadDto } from '../dto/query-leads.dto';
import { UpdateLeadDto } from '../dto/update-leads.dto';
import { LeadDocument } from '../model/leads.model';
import { LeadRepository } from '../repository/leads.repository';
import { ActivityType } from '../types/activity.type';
import { S3ClientService } from 'src/notes/client/s3-client.service';
import { ActivityClientService } from 'src/notes/client/activity-client.service';

// Define proper error types
interface ValidationError {
  name: string;
  message: string;
  errors: Record<string, { message: string }>;
}

interface MongoError {
  code: number;
  message: string;
}

// Helper function to safely get _id from LeadDocument
function getLeadId(lead: LeadDocument): string {
  return (lead as unknown as { _id: string })._id;
}

// Helper function to safely access lead fields
function getLeadFieldValue(lead: LeadDocument, field: string): string {
  const value = (lead as unknown as Record<string, unknown>)[field];
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly s3ClientService: S3ClientService,
    private readonly httpService: HttpService,
    private readonly activityClientService: ActivityClientService,
  ) {}

  async createLead(
    createLeadDto: CreateLeadDto & {
      file?: {
        buffer: string;
        originalname: string;
        mimetype: string;
        size: number;
      };
    },
  ): Promise<{ statusCode: number; message: string; data: LeadDocument }> {
    try {
      const { file, ...leadData } = createLeadDto;

      // Check for duplicate lead by email
      const existingLead = await this.leadRepository.findByEmail(
        leadData.email,
      );
      if (existingLead) {
        throw new ConflictException('Lead with this email already exists');
      }

      let leadImage: string | undefined = undefined;

      if (file) {
        try {
          const key = `leads/${Date.now()}-${file.originalname}`;

          const presignedUrl = await this.s3ClientService.generatePresignedUrl(
            key,
            file.mimetype,
          );

          const buffer = Buffer.from(file.buffer, 'base64');

          await firstValueFrom(
            this.httpService.put(presignedUrl, buffer, {
              headers: {
                'Content-Type': file.mimetype,
                'Content-Length': file.size,
              },
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
            }),
          );

          leadImage = key;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.logger.error(`Error uploading to S3: ${errorMessage}`);
          throw new InternalServerErrorException('Failed to upload lead image');
        }
      }

      const createdLead = await this.leadRepository.create({
        ...leadData,
        leadImage,
        createdDate: new Date(),
      });

      // Log lead creation activity
      void this.activityClientService.logActivity({
        leadId: getLeadId(createdLead),
        activityType: ActivityType.LEAD_CREATED,
        description: `Lead created by ${createLeadDto.createdBy}`,
        performedBy: createLeadDto.createdBy,
        metadata: {
          leadId: getLeadId(createdLead),
          leadOwner: createdLead.leadOwner,
          fullName: createdLead.fullName,
          email: createdLead.email,
          companyName: createdLead.companyName,
          status: createdLead.status,
          source: createdLead.source,
          score: createdLead.score,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Lead created successfully',
        data: createdLead,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'ValidationError') {
        const validationError = error as ValidationError;
        throw new BadRequestException(
          this.formatValidationError(validationError),
        );
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const mongoError = error as MongoError;
        if (mongoError.code === 11000) {
          throw new ConflictException('Lead with this email already exists');
        }
      }

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create lead');
    }
  }

  private formatValidationError(
    error: ValidationError,
  ): { field: string; message: string[] }[] {
    return Object.entries(error.errors).map(([field, err]) => ({
      field,
      message: [err.message],
    }));
  }

  async getLeadById(id: string): Promise<LeadDocument> {
    try {
      const lead = await this.leadRepository.findById(id);
      if (!lead) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }
      return lead;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch lead');
    }
  }

  async updateLead(
    id: string,
    updateLeadDto: UpdateLeadDto,
    fileData?: {
      buffer: string;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ): Promise<LeadDocument> {
    try {
      const lead = await this.leadRepository.findById(id);
      if (!lead) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }

      let leadImage: string | undefined = lead.leadImage;

      if (fileData) {
        try {
          if (leadImage) {
            this.logger.debug('Deleting old image from S3:', leadImage);
            await this.s3ClientService.deleteObject(leadImage);
            this.logger.debug('Old image deleted from S3:', leadImage);
          }

          const key = `leads/${Date.now()}-${fileData.originalname}`;

          const presignedUrl = await this.s3ClientService.generatePresignedUrl(
            key,
            fileData.mimetype,
          );

          const buffer = Buffer.from(fileData.buffer, 'base64');

          await firstValueFrom(
            this.httpService.put(presignedUrl, buffer, {
              headers: {
                'Content-Type': fileData.mimetype,
                'Content-Length': fileData.size,
              },
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
            }),
          );

          leadImage = key; // Store only key
          this.logger.debug('New lead image uploaded successfully:', leadImage);
        } catch (error) {
          this.logger.error('Failed to upload new lead image:', error);
          throw new InternalServerErrorException('Failed to upload lead image');
        }
      } else if (
        Object.prototype.hasOwnProperty.call(updateLeadDto, 'leadImage') &&
        (updateLeadDto.leadImage === null || updateLeadDto.leadImage === '')
      ) {
        if (leadImage) {
          try {
            this.logger.debug(
              'Deleting existing image due to null/empty DTO field:',
              leadImage,
            );
            await this.s3ClientService.deleteObject(leadImage);
            leadImage = undefined;
          } catch (error) {
            this.logger.error('Failed to delete lead image:', error);
            throw new InternalServerErrorException(
              'Failed to delete lead image',
            );
          }
        }
      }

      const updatedLead = await this.leadRepository.update(id, {
        ...updateLeadDto,
        leadImage,
      });

      if (!updatedLead) {
        throw new NotFoundException('Failed to update lead');
      }

      // Log lead updated activity
      void this.activityClientService.logActivity({
        leadId: getLeadId(updatedLead),
        activityType: ActivityType.LEAD_UPDATED,
        description: `Lead updated by ${updateLeadDto.updatedBy}`,
        performedBy: updateLeadDto.updatedBy,
        metadata: {
          leadId: getLeadId(updatedLead),
          leadOwner: updatedLead.leadOwner,
          fullName: updatedLead.fullName,
          email: updatedLead.email,
          companyName: updatedLead.companyName,
          status: updatedLead.status,
          source: updatedLead.source,
          score: updatedLead.score,
          updatedFields: Object.keys(updateLeadDto),
        },
      });

      return updatedLead;
    } catch (error) {
      this.logger.error('Error in update method:', error);
      if (error instanceof Error && error.name === 'ValidationError') {
        const validationError = error as ValidationError;
        throw new BadRequestException(
          this.formatValidationError(validationError),
        );
      }

      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update lead');
    }
  }

  async deleteLead(
    id: string,
    deletedBy: string,
  ): Promise<{
    statusCode: number;
    message: string;
    data: LeadDocument;
  }> {
    try {
      const lead = await this.leadRepository.findById(id);
      if (!lead) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }

      // Delete lead image from S3 if exists
      if (lead.leadImage) {
        try {
          const key = decodeURIComponent(
            lead.leadImage.split('?')[0].split('.com/')[1],
          );
          this.logger.debug(`Deleting lead image from S3: ${key}`);
          await this.s3ClientService.deleteObject(key);
        } catch (error) {
          this.logger.error('Failed to delete lead image from S3:', error);
        }
      }

      const deletedLead = await this.leadRepository.delete(id);
      if (!deletedLead) {
        throw new NotFoundException('Failed to delete lead');
      }

      // Log lead deletion activity
      void this.activityClientService.logActivity({
        leadId: id.toString(),
        activityType: ActivityType.LEAD_DELETED,
        description: `Lead deleted by ${deletedBy}`,
        performedBy: deletedBy,
        metadata: {
          leadId: id.toString(),
          leadOwner: lead.leadOwner,
          fullName: lead.fullName,
          email: lead.email,
          companyName: lead.companyName,
          status: lead.status,
          source: lead.source,
          score: lead.score,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Lead deleted successfully',
        data: deletedLead,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error deleting lead:', error);
      throw new InternalServerErrorException('Failed to delete lead');
    }
  }

  private formatFieldName(field: string): string {
    // Convert camelCase to Title Case with spaces
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  async bulkDelete(data: BulkOperationDto): Promise<{ deletedCount: number }> {
    try {
      const { leadIds } = data;

      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        throw new BadRequestException('Invalid or empty leadIds array');
      }

      // Check existence of all leads
      const leads = await this.leadRepository.findByIds(leadIds);
      if (leads.length !== leadIds.length) {
        throw new BadRequestException('Some leads do not exist');
      }

      // Delete associated S3 images if present
      for (const lead of leads) {
        void this.activityClientService.logActivity({
          leadId: getLeadId(lead),
          activityType: ActivityType.LEAD_DELETED,
          description: `Lead deleted by ${data.deletedBy}`,
          performedBy: data.deletedBy,
          metadata: {
            leadId: getLeadId(lead),
            leadOwner: lead.leadOwner,
            fullName: lead.fullName,
            email: lead.email,
            companyName: lead.companyName,
            status: lead.status,
            source: lead.source,
            score: lead.score,
            bulkOperation: true,
            totalLeadsInBatch: data.leadIds.length,
          },
        });

        if (lead.leadImage) {
          try {
            const key = decodeURIComponent(
              lead.leadImage.split('?')[0].split('.com/')[1],
            );
            this.logger.debug(
              `Deleting image from S3 for lead ${getLeadId(lead)}: ${key}`,
            );
            await this.s3ClientService.deleteObject(key);
          } catch (error) {
            this.logger.error(
              `Failed to delete image for lead ${getLeadId(lead)}:`,
              error,
            );
            // continue even if image deletion fails
          }
        }
      }

      // Bulk delete leads
      const result = await this.leadRepository.bulkDelete(leadIds);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error in bulk delete:', error);
      throw new InternalServerErrorException('Failed to delete leads');
    }
  }

  async exportSelectedToCsv(
    leadIds: string[],
    query: QueryLeadDto,
  ): Promise<string> {
    try {
      const leads = await this.leadRepository.findByIds(leadIds);

      if (leads.length === 0) {
        throw new NotFoundException('No leads found for export');
      }

      // Use columnsToDisplay if provided, otherwise use all fields
      const fieldsToExport = query.columnsToDisplay?.length
        ? query.columnsToDisplay
        : [
            '_id',
            'leadOwner',
            'fullName',
            'salutation',
            'email',
            'website',
            'contactNumber',
            'contactExtension',
            'alternateNumber',
            'alternateExtension',
            'companyName',
            'designation',
            'companySize',
            'industryType',
            'status',
            'source',
            'score',
            'scoreTrend',
            'preferredChannel',
            'lastActivityDate',
            'createdDate',
            'nextStage',
            'description',
            'linkedinUrl',
            'twitterUrl',
            'createdAt',
            'updatedAt',
          ];

      // Create headers based on selected fields
      const headers =
        fieldsToExport.map((field) => this.formatFieldName(field)).join(',') +
        '\n';

      let csvContent = headers;

      leads.forEach((lead) => {
        const row =
          fieldsToExport
            .map((field) => {
              const value = getLeadFieldValue(lead, field);
              return typeof value === 'string'
                ? `"${value.replace(/"/g, '""')}"`
                : `"${String(value)}"`;
            })
            .join(',') + '\n';

        csvContent += row;
      });

      return csvContent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to generate CSV file');
    }
  }

  async bulkUpdate(data: {
    leadIds: string[];
    updates: Record<string, unknown>;
    updatedBy: string;
  }): Promise<{ modifiedCount: number }> {
    try {
      const { leadIds, updates } = data;
      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        throw new BadRequestException('Invalid or empty leadIds array');
      }

      // First check if all leads exist
      const leads = await this.leadRepository.findByIds(leadIds);
      if (leads.length !== leadIds.length) {
        throw new BadRequestException('Some leads do not exist');
      }

      for (const lead of leads) {
        void this.activityClientService.logActivity({
          leadId: getLeadId(lead),
          activityType: ActivityType.LEAD_UPDATED,
          description: `Lead updated by ${data.updatedBy}`,
          performedBy: data.updatedBy,
          metadata: {
            leadId: getLeadId(lead),
            leadOwner: lead.leadOwner,
            fullName: lead.fullName,
            email: lead.email,
            companyName: lead.companyName,
            status: lead.status,
            source: lead.source,
            score: lead.score,
            bulkOperation: true,
            totalLeadsInBatch: data.leadIds.length,
            updatedFields: Object.keys(data.updates),
          },
        });
      }

      return await this.leadRepository.bulkUpdate(leadIds, updates);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update leads');
    }
  }

  async archiveLeads(data: {
    leadIds: string[];
    archive?: boolean;
  }): Promise<{ modifiedCount: number }> {
    try {
      const { leadIds, archive = true } = data;
      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        throw new BadRequestException('Invalid or empty leadIds array');
      }

      // First check if all leads exist
      const leads = await this.leadRepository.findByIds(leadIds);
      if (leads.length !== leadIds.length) {
        throw new BadRequestException('Some leads do not exist');
      }

      return await this.leadRepository.archiveLeads(leadIds, archive);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to archive leads');
    }
  }

  async findAllAdvanced(
    data: QueryLeadDto & {
      filters: FilterConditionDto[];
    },
  ): Promise<PaginatedResponse<LeadDocument>> {
    try {
      const {
        page = 1,
        limit = 25,
        search,
        searchBy,
        sortBy,
        sortOrder = SortOrder.DESC,
        archived,
        columnsToDisplay = [],
        columnsToSearch = [],
        filters,
      } = data;

      const { leads, total } = await this.leadRepository.findAllAdvanced({
        page,
        limit,
        search,
        searchBy,
        sortBy,
        sortOrder,
        archived,
        columnsToDisplay,
        columnsToSearch,
        filters,
      });

      const lastPage = Math.ceil(total / limit);

      return {
        data: leads,
        meta: {
          total,
          page,
          lastPage,
          hasNextPage: page < lastPage,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error('Error in findAllAdvanced:', error);
      throw new InternalServerErrorException(
        'Failed to fetch leads with advanced filters',
      );
    }
  }

  async exportLeadsAdvanced(data: {
    search?: string;
    searchBy?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
    archived?: boolean;
    columnsToDisplay?: string[];
    columnsToSearch?: string[];
    filters: FilterConditionDto[];
  }): Promise<string> {
    try {
      // Get all leads without pagination
      const { leads } = await this.leadRepository.findAllAdvanced({
        ...data,
        page: 1,
        limit: Number.MAX_SAFE_INTEGER,
      });

      // Use columnsToDisplay if provided, otherwise use all fields
      const fieldsToExport = data.columnsToDisplay?.length
        ? data.columnsToDisplay
        : [
            '_id',
            'leadOwner',
            'fullName',
            'salutation',
            'email',
            'website',
            'contactNumber',
            'contactExtension',
            'alternateNumber',
            'alternateExtension',
            'companyName',
            'designation',
            'companySize',
            'industryType',
            'status',
            'source',
            'score',
            'scoreTrend',
            'preferredChannel',
            'lastActivityDate',
            'createdDate',
            'nextStage',
            'description',
            'linkedinUrl',
            'twitterUrl',
            'createdAt',
            'updatedAt',
          ];

      // Create headers based on selected fields
      const headers =
        fieldsToExport.map((field) => this.formatFieldName(field)).join(',') +
        '\n';

      let csvContent = headers;

      leads.forEach((lead) => {
        const row =
          fieldsToExport
            .map((field) => {
              const value = getLeadFieldValue(lead, field);
              return typeof value === 'string'
                ? `"${value.replace(/"/g, '""')}"`
                : `"${String(value)}"`;
            })
            .join(',') + '\n';

        csvContent += row;
      });

      return csvContent;
    } catch (error) {
      this.logger.error('Error in exportLeadsAdvanced:', error);
      throw new InternalServerErrorException(
        'Failed to export leads with advanced filters',
      );
    }
  }
}
