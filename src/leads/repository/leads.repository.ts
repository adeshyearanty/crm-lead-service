import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import {
  FilterQuery,
  Model,
  Error as MongooseError,
  ProjectionType,
  Types,
} from 'mongoose';
import {
  AdvancedLeadFiltersDto,
  DatePreset,
  FilterCondition,
  FilterConditionDto,
} from '../dto/advanced-filters.dto';
import { CreateLeadDto } from '../dto/create-leads.dto';
import { SortOrder } from '../dto/pagination.dto';
import { QueryLeadDto } from '../dto/query-leads.dto';
import { UpdateLeadDto } from '../dto/update-leads.dto';
import { LeadDocument } from '../model/leads.model';

// Define proper types for MongoDB queries
interface MongoQuery {
  [key: string]: unknown;
}

interface MongoSortOptions {
  [key: string]: 1 | -1;
}

@Injectable()
export class LeadRepository {
  private readonly logger = new Logger(LeadRepository.name);

  constructor(@InjectModel('Lead') private Lead: Model<LeadDocument>) {}

  private handleMongoError(error: unknown): never {
    this.logger.error('MongoDB error:', error);

    if (error instanceof MongoError) {
      if (error.code === 11000) {
        throw new BadRequestException('Duplicate key error');
      }
    }

    if (error instanceof MongooseError.ValidationError) {
      throw new BadRequestException(
        Object.values(error.errors).map((err) => err.message),
      );
    }

    throw new InternalServerErrorException('Database operation failed');
  }

  async create(createLeadDto: CreateLeadDto): Promise<LeadDocument> {
    try {
      const lead = new this.Lead(createLeadDto);
      return await lead.save();
    } catch (error) {
      this.handleMongoError(error);
    }
  }

  private readonly dateFields = [
    'createdDate',
    'lastActivityDate',
    'createdAt',
    'updatedAt',
  ];

  private readonly numberFields = ['score'];

  private isValidField(field: string): boolean {
    const validFields = [
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
      'sequenceName',
      'score',
      'scoreTrend',
      'preferredChannel',
      'lastActivityDate',
      'createdDate',
      'nextStage',
      'description',
      'linkedinUrl',
      'twitterUrl',
      'annualRevenue',
      'updatedBy',
      'createdAt',
      'updatedAt',
      'isArchived',
    ];

    return validFields.includes(field);
  }

  async findById(id: string): Promise<LeadDocument | null> {
    try {
      return await this.Lead.findById(id).exec();
    } catch (error) {
      return this.handleMongoError(error);
    }
  }

  async update(
    id: string,
    updateLeadDto: UpdateLeadDto,
  ): Promise<LeadDocument | null> {
    try {
      const result = await this.Lead.findByIdAndUpdate(id, updateLeadDto, {
        new: true,
        runValidators: true,
      }).exec();

      return result;
    } catch (error) {
      return this.handleMongoError(error);
    }
  }

  async delete(id: string): Promise<LeadDocument | null> {
    try {
      return await this.Lead.findByIdAndDelete(id).exec();
    } catch (error) {
      return this.handleMongoError(error);
    }
  }

  async findByEmail(email: string): Promise<LeadDocument | null> {
    try {
      return await this.Lead.findOne({ email }).exec();
    } catch (error) {
      this.handleMongoError(error);
    }
  }

  async bulkDelete(leadIds: string[]): Promise<{ deletedCount: number }> {
    try {
      const result = await this.Lead.deleteMany({
        _id: { $in: leadIds },
      }).exec();
      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      return this.handleMongoError(error);
    }
  }

  async findByIds(leadIds: string[]): Promise<LeadDocument[]> {
    try {
      this.logger.debug('Finding leads by IDs:', leadIds);
      const objectIds = leadIds.map((id) => new Types.ObjectId(id));
      return await this.Lead.find({ _id: { $in: objectIds } }).exec();
    } catch (error) {
      return this.handleMongoError(error);
    }
  }

  async bulkUpdate(
    leadIds: string[],
    updateData: Record<string, unknown>,
  ): Promise<{ modifiedCount: number }> {
    try {
      const result = await this.Lead.updateMany(
        { _id: { $in: leadIds } },
        { $set: updateData },
      ).exec();
      return { modifiedCount: result.modifiedCount || 0 };
    } catch (error) {
      return this.handleMongoError(error);
    }
  }

  async archiveLeads(
    leadIds: string[],
    archive: boolean = true,
  ): Promise<{ modifiedCount: number; success: boolean }> {
    try {
      const result = await this.Lead.updateMany(
        { _id: { $in: leadIds } },
        { $set: { isArchived: archive } },
      ).exec();
      return { modifiedCount: result.modifiedCount || 0, success: true };
    } catch (error) {
      return this.handleMongoError(error);
    }
  }

  private buildAdvancedFilterQuery(
    filters: AdvancedLeadFiltersDto['filters'],
  ): MongoQuery {
    const query: MongoQuery = {};

    for (const filter of filters) {
      const { field, condition } = filter;

      if (!this.isValidField(field)) {
        throw new BadRequestException(`Invalid field: ${field}`);
      }

      this.logger.debug(
        `Processing filter - field: ${field}, condition: ${condition === FilterCondition.NOT_EQUALS ? 'NOT_EQUALS' : condition === FilterCondition.EQUALS ? 'EQUALS' : condition === FilterCondition.CONTAINS ? 'CONTAINS' : condition === FilterCondition.GREATER_THAN ? 'GREATER_THAN' : condition === FilterCondition.LESS_THAN ? 'LESS_THAN' : condition === FilterCondition.BETWEEN ? 'BETWEEN' : condition === FilterCondition.PRESET ? 'PRESET' : condition === FilterCondition.CUSTOM_RANGE ? 'CUSTOM_RANGE' : condition}`,
      );

      switch (condition) {
        case FilterCondition.EQUALS:
          if (filter.values?.length || filter.value) {
            (query as Record<string, unknown>)[field] = {
              $in: filter.values || [filter.value],
            };
          }
          break;

        case FilterCondition.NOT_EQUALS:
          if (filter.values?.length || filter.value) {
            (query as Record<string, unknown>)[field] = {
              $nin: filter.values || [filter.value],
            };
            this.logger.debug(
              `Built condition: ${JSON.stringify((query as Record<string, unknown>)[field], null, 2)}`,
            );
          }
          break;

        case FilterCondition.CONTAINS:
          if (filter.values?.length) {
            (query as Record<string, unknown>)[field] = {
              $regex: filter.values[0],
              $options: 'i',
            };
          }
          break;

        case FilterCondition.GREATER_THAN:
          if (typeof filter.value === 'number') {
            (query as Record<string, unknown>)[field] = { $gt: filter.value };
          }
          break;

        case FilterCondition.LESS_THAN:
          if (typeof filter.value === 'number') {
            (query as Record<string, unknown>)[field] = { $lt: filter.value };
          }
          break;

        case FilterCondition.BETWEEN:
          if (
            typeof filter.value === 'number' &&
            typeof filter.value2 === 'number'
          ) {
            (query as Record<string, unknown>)[field] = {
              $gte: filter.value,
              $lte: filter.value2,
            };
          }
          break;

        case FilterCondition.PRESET:
          if (filter.preset && this.dateFields.includes(field)) {
            const dateRange = this.getDateRangeFromPreset(filter.preset);
            if (dateRange) {
              (query as Record<string, unknown>)[field] = {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate,
              };
            }
          }
          break;

        case FilterCondition.CUSTOM_RANGE:
          if (
            filter.startDate &&
            filter.endDate &&
            this.dateFields.includes(field)
          ) {
            (query as Record<string, unknown>)[field] = {
              $gte: new Date(filter.startDate),
              $lte: new Date(filter.endDate),
            };
          }
          break;
      }
    }

    return query;
  }

  private getDateRangeFromPreset(
    preset: DatePreset,
  ): { startDate: Date; endDate: Date } | null {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const getDaysAgo = (days: number) => {
      const date = new Date(now);
      date.setDate(now.getDate() - days);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    switch (preset) {
      case DatePreset.TODAY:
        return { startDate: startOfToday, endDate: endOfToday };

      case DatePreset.YESTERDAY: {
        const start = getDaysAgo(1);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return { startDate: start, endDate: end };
      }

      case DatePreset.THIS_MONTH: {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { startDate: start, endDate: endOfToday };
      }

      case DatePreset.THIS_YEAR: {
        const start = new Date(now.getFullYear(), 0, 1);
        return { startDate: start, endDate: endOfToday };
      }

      case DatePreset.LAST_7_DAYS:
        return { startDate: getDaysAgo(7), endDate: endOfToday };

      case DatePreset.LAST_30_DAYS:
        return { startDate: getDaysAgo(30), endDate: endOfToday };

      case DatePreset.LAST_90_DAYS:
        return { startDate: getDaysAgo(90), endDate: endOfToday };

      case DatePreset.LAST_180_DAYS:
        return { startDate: getDaysAgo(180), endDate: endOfToday };

      case DatePreset.LAST_365_DAYS:
        return { startDate: getDaysAgo(365), endDate: endOfToday };

      case DatePreset.THIS_FISCAL_YEAR: {
        // Assuming fiscal year starts in April (adjust if different)
        const fiscalStartMonth = 3; // April = 3 (0-based index)
        const fiscalStart = new Date(
          now.getMonth() >= fiscalStartMonth
            ? now.getFullYear()
            : now.getFullYear() - 1,
          fiscalStartMonth,
          1,
        );
        return { startDate: fiscalStart, endDate: endOfToday };
      }

      case DatePreset.LAST_FISCAL_YEAR: {
        const fiscalStartMonth = 3; // April
        const start = new Date(
          now.getMonth() >= fiscalStartMonth
            ? now.getFullYear() - 1
            : now.getFullYear() - 2,
          fiscalStartMonth,
          1,
        );
        const end = new Date(
          start.getFullYear() + 1,
          fiscalStartMonth,
          0,
          23,
          59,
          59,
          999,
        ); // end of March
        return { startDate: start, endDate: end };
      }

      default:
        return null;
    }
  }

  async findAllAdvanced(
    data: QueryLeadDto & {
      filters: FilterConditionDto[];
    },
  ): Promise<{ leads: LeadDocument[]; total: number }> {
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

      const skip = (page - 1) * limit;
      const query: MongoQuery = {};
      const projection: Record<string, number | boolean | string> = {};

      // Handle column projection
      if (columnsToDisplay && columnsToDisplay.length > 0) {
        columnsToDisplay.forEach((column) => {
          projection[column] = 1;
        });
        // Always include _id
        projection._id = 1;
      }

      // Handle archived filter
      if (archived !== undefined) {
        (query as Record<string, unknown>).isArchived = archived;
      }

      // Handle search
      if (search) {
        if (searchBy && this.isValidField(searchBy)) {
          // Search in specific field
          (query as Record<string, unknown>)[searchBy] = {
            $regex: search,
            $options: 'i',
          };
        } else if (columnsToSearch && columnsToSearch.length > 0) {
          // Search in specified columns
          (query as Record<string, unknown>).$or = columnsToSearch
            .filter((field) => this.isValidField(field))
            .map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            }));
        } else {
          // Default search in all searchable fields
          (query as Record<string, unknown>).$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } },
            { designation: { $regex: search, $options: 'i' } },
          ];
        }
      }

      // Handle advanced filters
      const advancedQuery = this.buildAdvancedFilterQuery(filters);
      Object.assign(query, advancedQuery);

      // Build sort options
      const sortOptions: MongoSortOptions = {};
      if (sortBy && this.isValidField(sortBy)) {
        sortOptions[sortBy] = sortOrder === SortOrder.ASC ? 1 : -1;
      } else {
        sortOptions.createdDate = -1; // Default sorting
      }

      this.logger.debug('Final query:', query);
      this.logger.debug('Sort options:', sortOptions);

      const [leads, total] = await Promise.all([
        this.Lead.find(
          query as FilterQuery<LeadDocument>,
          Object.keys(projection).length > 0
            ? (projection as ProjectionType<LeadDocument>)
            : undefined,
        )
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.Lead.countDocuments(query as FilterQuery<LeadDocument>).exec(),
      ]);

      return { leads, total };
    } catch (error) {
      this.logger.error('MongoDB error in findAllAdvanced:', error);
      return this.handleMongoError(error);
    }
  }
}
