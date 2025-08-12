import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { CreateCompanySizeDto } from '../dto/company-size/create-company-size.dto';
import {
  QueryCompanySizeDto,
  SortOrder,
} from '../dto/company-size/query-company-size.dto';
import { UpdateCompanySizeDto } from '../dto/company-size/update-company-size.dto';
import { CompanySize } from '../model/company-size.model';

@Injectable()
export class CompanySizeRepository {
  constructor(
    @InjectModel(CompanySize.name)
    private readonly companySizeModel: Model<CompanySize>,
  ) {}

  async create(
    createCompanySizeDto: CreateCompanySizeDto,
  ): Promise<CompanySize> {
    const companySize = new this.companySizeModel(createCompanySizeDto);
    return companySize.save();
  }

  async findAll(query: QueryCompanySizeDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
    } = query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: RootFilterQuery<CompanySize> = {};
    if (search) {
      searchQuery.$or = [
        { label: { $regex: search, $options: 'i' } },
        { employeeRange: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await this.companySizeModel.countDocuments(
      searchQuery as RootFilterQuery<CompanySize>,
    );

    // Get paginated results
    const items = await this.companySizeModel
      .find(searchQuery as RootFilterQuery<CompanySize>)
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

  async findById(id: string): Promise<CompanySize | null> {
    return this.companySizeModel.findById(id).exec();
  }

  async findByLabel(label: string): Promise<CompanySize | null> {
    return this.companySizeModel.findOne({ label }).exec();
  }

  async update(
    id: string,
    updateCompanySizeDto: UpdateCompanySizeDto,
  ): Promise<CompanySize | null> {
    return this.companySizeModel
      .findByIdAndUpdate(
        id,
        {
          ...updateCompanySizeDto,
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<CompanySize | null> {
    return (await this.companySizeModel.findByIdAndDelete(id).exec()) || null;
  }

  async setDefault(id: string): Promise<void> {
    await this.companySizeModel.updateMany({}, { isDefault: false }).exec();
    await this.companySizeModel
      .findByIdAndUpdate(id, { isDefault: true })
      .exec();
  }

  async getDefault(): Promise<CompanySize | null> {
    return this.companySizeModel.findOne({ isDefault: true }).exec();
  }

  async count(): Promise<number> {
    return this.companySizeModel.countDocuments().exec();
  }

  isInUse(): boolean {
    // This is a placeholder implementation
    // In a real application, this would check the leads collection
    // to see if any leads are using this company size
    return false;
  }
}
