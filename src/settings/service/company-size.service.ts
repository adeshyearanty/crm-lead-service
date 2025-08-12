import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CompanySizeRepository } from '../repository/company-size.repository';
import { CreateCompanySizeDto } from '../dto/company-size/create-company-size.dto';
import { CompanySize } from '../model/company-size.model';
import { PaginatedCompanySizeResponseDto } from '../dto/company-size/paginated-response.dto';
import { QueryCompanySizeDto } from '../dto/company-size/query-company-size.dto';
import { UpdateCompanySizeDto } from '../dto/company-size/update-company-size.dto';

@Injectable()
export class CompanySizeService {
  constructor(private readonly companySizeRepository: CompanySizeRepository) {}

  async create(
    createCompanySizeDto: CreateCompanySizeDto,
  ): Promise<CompanySize> {
    const existingCompanySize = await this.companySizeRepository.findByLabel(
      createCompanySizeDto.label,
    );

    if (existingCompanySize) {
      throw new ConflictException(
        'Company size with this label already exists',
      );
    }

    const companySize = await this.companySizeRepository.create({
      ...createCompanySizeDto,
    });

    if (createCompanySizeDto.isDefault) {
      await this.companySizeRepository.setDefault(companySize.id as string);
    }

    return companySize;
  }

  async findAll(
    query: QueryCompanySizeDto,
  ): Promise<PaginatedCompanySizeResponseDto> {
    return this.companySizeRepository.findAll(query);
  }

  async findById(id: string): Promise<CompanySize> {
    const companySize = await this.companySizeRepository.findById(id);
    if (!companySize) {
      throw new NotFoundException('Company size not found');
    }
    return companySize;
  }

  async update(
    id: string,
    updateCompanySizeDto: UpdateCompanySizeDto,
  ): Promise<CompanySize> {
    const companySize = await this.companySizeRepository.findById(id);
    if (!companySize) {
      throw new NotFoundException('Company size not found');
    }

    if (updateCompanySizeDto.label) {
      const existingCompanySize = await this.companySizeRepository.findByLabel(
        updateCompanySizeDto.label,
      );

      if (existingCompanySize && existingCompanySize.id !== id) {
        throw new ConflictException(
          'Company size with this label already exists',
        );
      }
    }

    const updatedCompanySize = await this.companySizeRepository.update(
      id,
      updateCompanySizeDto,
    );
    if (!updatedCompanySize) {
      throw new NotFoundException('Company size not found');
    }
    return updatedCompanySize;
  }

  async remove(id: string): Promise<CompanySize> {
    const companySize = await this.companySizeRepository.findById(id);
    if (!companySize) {
      throw new NotFoundException('Company size not found');
    }

    // if (companySize.isDefault) {
    //   throw new ConflictException('Cannot delete default company size');
    // }

    const isInUse = this.companySizeRepository.isInUse();
    if (isInUse) {
      throw new ConflictException(
        'Company size is in use and cannot be deleted',
      );
    }

    const deletedCompanySize = await this.companySizeRepository.delete(id);
    if (!deletedCompanySize) {
      throw new NotFoundException('Company size not found during deletion');
    }

    return deletedCompanySize;
  }

  async setDefault(id: string): Promise<void> {
    const companySize = await this.companySizeRepository.findById(id);
    if (!companySize) {
      throw new NotFoundException('Company size not found');
    }

    await this.companySizeRepository.setDefault(id);
  }

  async getDefault(): Promise<CompanySize> {
    const companySize = await this.companySizeRepository.getDefault();
    if (!companySize) {
      throw new NotFoundException('Default company size not found');
    }
    return companySize;
  }
}
