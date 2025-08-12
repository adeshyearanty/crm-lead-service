import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeadStatusDto } from '../dto/lead-status/create-lead-status.dto';
import { PaginatedLeadStatusResponseDto } from '../dto/lead-status/paginated-response.dto';
import { QueryLeadStatusDto } from '../dto/lead-status/query-lead-status.dto';
import { UpdateLeadStatusDto } from '../dto/lead-status/update-lead-status.dto';
import { LeadStatus } from '../model/lead-status.model';
import { LeadStatusRepository } from '../repository/lead-status.repository';

@Injectable()
export class LeadStatusService {
  constructor(private readonly leadStatusRepository: LeadStatusRepository) {}

  async create(createLeadStatusDto: CreateLeadStatusDto): Promise<LeadStatus> {
    const existingLeadStatus = await this.leadStatusRepository.findByName(
      createLeadStatusDto.name,
    );

    if (existingLeadStatus) {
      throw new ConflictException('Lead status with this name already exists');
    }

    const leadStatus =
      await this.leadStatusRepository.create(createLeadStatusDto);

    if (createLeadStatusDto.isDefault) {
      await this.leadStatusRepository.setDefault(leadStatus.id as string);
    }

    return leadStatus;
  }

  async findAll(
    query: QueryLeadStatusDto,
  ): Promise<PaginatedLeadStatusResponseDto> {
    return this.leadStatusRepository.findAll(query);
  }

  async findById(id: string): Promise<LeadStatus> {
    const leadStatus = await this.leadStatusRepository.findById(id);
    if (!leadStatus) {
      throw new NotFoundException('Lead status not found');
    }
    return leadStatus;
  }

  async update(
    id: string,
    updateLeadStatusDto: UpdateLeadStatusDto,
  ): Promise<LeadStatus> {
    const leadStatus = await this.leadStatusRepository.findById(id);
    if (!leadStatus) {
      throw new NotFoundException('Lead status not found');
    }

    if (updateLeadStatusDto.name) {
      const existingLeadStatus = await this.leadStatusRepository.findByName(
        updateLeadStatusDto.name,
      );

      if (existingLeadStatus && existingLeadStatus.id !== id) {
        throw new ConflictException(
          'Lead status with this name already exists',
        );
      }
    }

    const updatedLeadStatus = await this.leadStatusRepository.update(
      id,
      updateLeadStatusDto,
    );
    if (!updatedLeadStatus) {
      throw new NotFoundException('Lead status not found');
    }

    if (updateLeadStatusDto.isDefault) {
      await this.leadStatusRepository.setDefault(id);
    }

    return updatedLeadStatus;
  }

  async delete(id: string): Promise<LeadStatus> {
    const leadStatus = await this.leadStatusRepository.findById(id);
    if (!leadStatus) {
      throw new NotFoundException('Lead status not found');
    }

    // if (leadStatus.isDefault) {
    //   throw new ConflictException('Cannot delete default lead status');
    // }

    const isInUse = this.leadStatusRepository.isInUse();
    if (isInUse) {
      throw new ConflictException(
        'Lead status is in use and cannot be deleted',
      );
    }

    const deletedLeadStatus = await this.leadStatusRepository.delete(id);
    if (!deletedLeadStatus) {
      throw new NotFoundException('Lead status not found during deletion');
    }

    return deletedLeadStatus;
  }

  async setDefault(id: string): Promise<void> {
    const leadStatus = await this.leadStatusRepository.findById(id);
    if (!leadStatus) {
      throw new NotFoundException('Lead status not found');
    }

    await this.leadStatusRepository.setDefault(id);
  }

  async getDefault(): Promise<LeadStatus> {
    const leadStatus = await this.leadStatusRepository.getDefault();
    if (!leadStatus) {
      throw new NotFoundException('Default lead status not found');
    }
    return leadStatus;
  }
}
