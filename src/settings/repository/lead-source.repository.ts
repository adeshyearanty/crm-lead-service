import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { CreateLeadSourceDto } from '../dto/lead-source/create-lead-source.dto';
import {
  QueryLeadSourceDto,
  SortOrder,
} from '../dto/lead-source/query-lead-source.dto';
import { UpdateLeadSourceDto } from '../dto/lead-source/update-lead-source.dto';
import { LeadSource } from '../model/lead-source.model';

@Injectable()
export class LeadSourceRepository {
  constructor(
    @InjectModel(LeadSource.name)
    private readonly leadSourceModel: Model<LeadSource>,
  ) {}

  async create(createLeadSourceDto: CreateLeadSourceDto): Promise<LeadSource> {
    const leadSource = new this.leadSourceModel({
      ...createLeadSourceDto,
      isDefault: false,
    });
    return leadSource.save();
  }

  async findAll(query: QueryLeadSourceDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
    } = query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: RootFilterQuery<LeadSource> = {};
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await this.leadSourceModel.countDocuments(
      searchQuery as RootFilterQuery<LeadSource>,
    );

    // Get paginated results
    const items = await this.leadSourceModel
      .find(searchQuery as RootFilterQuery<LeadSource>)
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

  async findById(id: string): Promise<LeadSource | null> {
    return this.leadSourceModel.findById(id).exec();
  }

  async findByName(name: string): Promise<LeadSource | null> {
    return this.leadSourceModel.findOne({ name }).exec();
  }

  async update(
    id: string,
    updateLeadSourceDto: UpdateLeadSourceDto,
  ): Promise<LeadSource | null> {
    return this.leadSourceModel
      .findByIdAndUpdate(
        id,
        {
          ...updateLeadSourceDto,
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<LeadSource> {
    return (await this.leadSourceModel.findByIdAndDelete(id).exec())!;
  }

  async setDefault(id: string): Promise<void> {
    await this.leadSourceModel.updateMany({}, { isDefault: false }).exec();
    await this.leadSourceModel
      .findByIdAndUpdate(id, { isDefault: true })
      .exec();
  }

  async getDefault(): Promise<LeadSource | null> {
    return this.leadSourceModel.findOne({ isDefault: true }).exec();
  }

  async countByOrganization(): Promise<number> {
    return this.leadSourceModel.countDocuments().exec();
  }

  isInUse(): boolean {
    return false;
  }
}
