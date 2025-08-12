import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { CreateIndustryTypeDto } from '../dto/industry-type/create-industry-type.dto';
import { PaginatedIndustryTypeResponseDto } from '../dto/industry-type/paginated-response.dto';
import {
  QueryIndustryTypeDto,
  SortOrder,
} from '../dto/industry-type/query-industry-type.dto';
import { UpdateIndustryTypeDto } from '../dto/industry-type/update-industry-type.dto';
import { IndustryType } from '../model/industry-type.model';

@Injectable()
export class IndustryTypeRepository {
  constructor(
    @InjectModel(IndustryType.name)
    private readonly industryTypeModel: Model<IndustryType>,
  ) {}

  async create(
    createIndustryTypeDto: CreateIndustryTypeDto,
  ): Promise<IndustryType> {
    const createdIndustryType = new this.industryTypeModel(
      createIndustryTypeDto,
    );
    return createdIndustryType.save();
  }

  async findAll(
    query: QueryIndustryTypeDto,
  ): Promise<PaginatedIndustryTypeResponseDto> {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const filter: RootFilterQuery<IndustryType> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === SortOrder.DESC ? -1 : 1;
    }

    const [items, total] = await Promise.all([
      this.industryTypeModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.industryTypeModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<IndustryType | null> {
    return this.industryTypeModel.findById(id).exec();
  }

  async findByName(name: string): Promise<IndustryType | null> {
    return this.industryTypeModel.findOne({ name }).exec();
  }

  async update(
    id: string,
    updateIndustryTypeDto: UpdateIndustryTypeDto,
  ): Promise<IndustryType | null> {
    return this.industryTypeModel
      .findByIdAndUpdate(id, updateIndustryTypeDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<IndustryType> {
    return (await this.industryTypeModel.findByIdAndDelete(id).exec())!;
  }

  async setDefault(id: string): Promise<void> {
    const filter: RootFilterQuery<IndustryType> = { isDefault: true };

    await this.industryTypeModel
      .updateMany(filter, { isDefault: false })
      .exec();
    await this.industryTypeModel
      .findByIdAndUpdate(id, { isDefault: true })
      .exec();
  }

  async getDefault(): Promise<IndustryType | null> {
    const filter: RootFilterQuery<IndustryType> = { isDefault: true };
    return this.industryTypeModel.findOne(filter).exec();
  }

  isInUse(): boolean {
    // This is a placeholder implementation
    // In a real application, this would check if any leads are using this industry type
    return false;
  }
}
