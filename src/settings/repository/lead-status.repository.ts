import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';

// Models
import { LeadStatus } from '../model/lead-status.model';

// Dtos
import { CreateLeadStatusDto } from '../dto/lead-status/create-lead-status.dto';
import {
  QueryLeadStatusDto,
  SortOrder,
} from '../dto/lead-status/query-lead-status.dto';
import { UpdateLeadStatusDto } from '../dto/lead-status/update-lead-status.dto';

@Injectable()
export class LeadStatusRepository {
  constructor(
    @InjectModel(LeadStatus.name)
    private readonly leadStatusModel: Model<LeadStatus>,
  ) {}

  async create(createLeadStatusDto: CreateLeadStatusDto): Promise<LeadStatus> {
    const leadStatus = new this.leadStatusModel({
      ...createLeadStatusDto,
      isDefault: false,
    });
    return leadStatus.save();
  }

  async findAll(query: QueryLeadStatusDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
    } = query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: RootFilterQuery<LeadStatus> = {};
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await this.leadStatusModel.countDocuments(
      searchQuery as RootFilterQuery<LeadStatus>,
    );

    // Get paginated results
    const items = await this.leadStatusModel
      .find(searchQuery as RootFilterQuery<LeadStatus>)
      .sort({ [sortBy]: sortOrder === SortOrder.ASC ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };
  }

  async findById(id: string): Promise<LeadStatus | null> {
    return this.leadStatusModel.findById(id).exec();
  }

  async findByName(name: string): Promise<LeadStatus | null> {
    return this.leadStatusModel.findOne({ name }).exec();
  }

  async update(
    id: string,
    updateLeadStatusDto: UpdateLeadStatusDto,
  ): Promise<LeadStatus | null> {
    return this.leadStatusModel
      .findByIdAndUpdate(
        id,
        {
          ...updateLeadStatusDto,
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<LeadStatus> {
    return (await this.leadStatusModel.findByIdAndDelete(id).exec())!;
  }

  async setDefault(id: string): Promise<void> {
    await this.leadStatusModel.updateMany({}, { isDefault: false }).exec();
    await this.leadStatusModel
      .findByIdAndUpdate(id, { isDefault: true })
      .exec();
  }

  async getDefault(): Promise<LeadStatus | null> {
    return this.leadStatusModel.findOne({ isDefault: true }).exec();
  }

  async countByOrganization(): Promise<number> {
    return this.leadStatusModel.countDocuments().exec();
  }

  isInUse(): boolean {
    return false;
  }
}
