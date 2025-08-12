import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeadSourceDto } from '../dto/lead-source/create-lead-source.dto';
import { PaginatedLeadSourceResponseDto } from '../dto/lead-source/paginated-response.dto';
import { QueryLeadSourceDto } from '../dto/lead-source/query-lead-source.dto';
import { UpdateLeadSourceDto } from '../dto/lead-source/update-lead-source.dto';
import { LeadSource } from '../model/lead-source.model';
import { LeadSourceRepository } from '../repository/lead-source.repository';

@Injectable()
export class LeadSourceService {
  constructor(private readonly leadSourceRepository: LeadSourceRepository) {}

  async create(createLeadSourceDto: CreateLeadSourceDto): Promise<LeadSource> {
    const existingLeadSource = await this.leadSourceRepository.findByName(
      createLeadSourceDto.name,
    );

    if (existingLeadSource) {
      throw new ConflictException('Lead source with this name already exists');
    }

    const leadSource =
      await this.leadSourceRepository.create(createLeadSourceDto);

    if (createLeadSourceDto.isDefault) {
      await this.leadSourceRepository.setDefault(leadSource.id as string);
    }

    return leadSource;
  }

  async findAll(
    query: QueryLeadSourceDto,
  ): Promise<PaginatedLeadSourceResponseDto> {
    return this.leadSourceRepository.findAll(query);
  }

  async findById(id: string): Promise<LeadSource> {
    const leadSource = await this.leadSourceRepository.findById(id);
    if (!leadSource) {
      throw new NotFoundException('Lead source not found');
    }
    return leadSource;
  }

  async update(payload: {
    id: string;
    dto: UpdateLeadSourceDto;
  }): Promise<LeadSource> {
    const { id, dto } = payload;
    const leadSource = await this.leadSourceRepository.findById(id);
    if (!leadSource) {
      throw new NotFoundException('Lead source not found');
    }

    if (dto.name) {
      const existingLeadSource = await this.leadSourceRepository.findByName(
        dto.name,
      );

      if (existingLeadSource && existingLeadSource.id !== id) {
        throw new ConflictException(
          'Lead source with this name already exists',
        );
      }
    }

    const updatedLeadSource = await this.leadSourceRepository.update(id, dto);
    if (!updatedLeadSource) {
      throw new NotFoundException('Lead source not found');
    }

    if (dto.isDefault) {
      await this.leadSourceRepository.setDefault(id);
    }

    return updatedLeadSource;
  }

  async delete(id: string): Promise<LeadSource> {
    const leadSource = await this.leadSourceRepository.findById(id);
    if (!leadSource) {
      throw new NotFoundException('Lead source not found');
    }

    const isInUse = this.leadSourceRepository.isInUse();
    if (isInUse) {
      throw new ConflictException(
        'Lead source is in use and cannot be deleted',
      );
    }

    const deletedLeadSource = await this.leadSourceRepository.delete(id);
    if (!deletedLeadSource) {
      throw new NotFoundException('Lead source not found during deletion');
    }
    return deletedLeadSource;
  }

  async setDefault(id: string): Promise<void> {
    const leadSource = await this.leadSourceRepository.findById(id);
    if (!leadSource) {
      throw new NotFoundException('Lead source not found');
    }

    await this.leadSourceRepository.setDefault(id);
  }

  async getDefault(): Promise<LeadSource> {
    const leadSource = await this.leadSourceRepository.getDefault();
    if (!leadSource) {
      throw new NotFoundException('Default lead source not found');
    }
    return leadSource;
  }

  async getUsageCount(id: string): Promise<number> {
    const leadSource = await this.leadSourceRepository.findById(id);
    if (!leadSource) {
      throw new NotFoundException('Lead source not found');
    }
    // This is a placeholder implementation
    // In a real application, this would count the number of leads using this source
    return 0;
  }
}
