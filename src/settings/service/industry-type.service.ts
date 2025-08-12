import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateIndustryTypeDto } from '../dto/industry-type/create-industry-type.dto';
import { PaginatedIndustryTypeResponseDto } from '../dto/industry-type/paginated-response.dto';
import { QueryIndustryTypeDto } from '../dto/industry-type/query-industry-type.dto';
import { UpdateIndustryTypeDto } from '../dto/industry-type/update-industry-type.dto';
import { IndustryType } from '../model/industry-type.model';
import { IndustryTypeRepository } from '../repository/industry-type.repository';

@Injectable()
export class IndustryTypeService {
  constructor(
    private readonly industryTypeRepository: IndustryTypeRepository,
  ) {}

  async create(
    createIndustryTypeDto: CreateIndustryTypeDto,
  ): Promise<IndustryType> {
    const existingIndustryType = await this.industryTypeRepository.findByName(
      createIndustryTypeDto.name,
    );

    if (existingIndustryType) {
      throw new ConflictException(
        'Industry type with this name already exists',
      );
    }

    const industryType = await this.industryTypeRepository.create({
      ...createIndustryTypeDto,
    });

    if (createIndustryTypeDto.isDefault) {
      await this.industryTypeRepository.setDefault(industryType.id as string);
    }

    return industryType;
  }

  async findAll(
    query: QueryIndustryTypeDto,
  ): Promise<PaginatedIndustryTypeResponseDto> {
    return this.industryTypeRepository.findAll(query);
  }

  async findById(id: string): Promise<IndustryType> {
    const industryType = await this.industryTypeRepository.findById(id);
    if (!industryType) {
      throw new NotFoundException('Industry type not found');
    }
    return industryType;
  }

  async update(
    id: string,
    updateIndustryTypeDto: UpdateIndustryTypeDto,
  ): Promise<IndustryType> {
    const industryType = await this.industryTypeRepository.findById(id);
    if (!industryType) {
      throw new NotFoundException('Industry type not found');
    }

    if (updateIndustryTypeDto.name) {
      const existingIndustryType = await this.industryTypeRepository.findByName(
        updateIndustryTypeDto.name,
      );

      if (existingIndustryType && existingIndustryType.id !== id) {
        throw new ConflictException(
          'Industry type with this name already exists',
        );
      }
    }

    const updatedIndustryType = await this.industryTypeRepository.update(
      id,
      updateIndustryTypeDto,
    );
    if (!updatedIndustryType) {
      throw new NotFoundException('Industry type not found');
    }

    if (updateIndustryTypeDto.isDefault) {
      await this.industryTypeRepository.setDefault(id);
    }

    return updatedIndustryType;
  }

  async delete(id: string): Promise<IndustryType> {
    const industryType = await this.industryTypeRepository.findById(id);
    if (!industryType) {
      throw new NotFoundException('Industry type not found');
    }

    // if (industryType.isDefault) {
    //   throw new ConflictException('Cannot delete default industry type');
    // }

    const isInUse = this.industryTypeRepository.isInUse();
    if (isInUse) {
      throw new ConflictException(
        'Industry type is in use and cannot be deleted',
      );
    }

    const deletedIndustryType = await this.industryTypeRepository.delete(id);
    if (!deletedIndustryType) {
      throw new NotFoundException('Industry type not found during deletion');
    }

    return deletedIndustryType;
  }

  async setDefault(id: string): Promise<void> {
    const industryType = await this.industryTypeRepository.findById(id);
    if (!industryType) {
      throw new NotFoundException('Industry type not found');
    }

    await this.industryTypeRepository.setDefault(id);
  }

  async getDefault(): Promise<IndustryType> {
    const industryType = await this.industryTypeRepository.getDefault();
    if (!industryType) {
      throw new NotFoundException('Default industry type not found');
    }
    return industryType;
  }

  async getUsageCount(id: string): Promise<number> {
    const industryType = await this.industryTypeRepository.findById(id);
    if (!industryType) {
      throw new NotFoundException('Industry type not found');
    }
    // This is a placeholder implementation
    // In a real application, this would count the number of leads using this industry type
    return 0;
  }
}
