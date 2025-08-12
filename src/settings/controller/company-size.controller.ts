import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCompanySizeDto } from '../dto/company-size/create-company-size.dto';
import { QueryCompanySizeDto } from '../dto/company-size/query-company-size.dto';
import { UpdateCompanySizeDto } from '../dto/company-size/update-company-size.dto';
import { CompanySizeService } from '../service/company-size.service';

@ApiTags('Company Sizes')
@Controller({
  version: '1',
  path: 'company-sizes',
})
export class CompanySizeController {
  constructor(private readonly companySizeService: CompanySizeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company size' })
  @ApiResponse({
    status: 201,
    description: 'Company size created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Company size with this label already exists',
  })
  create(@Body() dto: CreateCompanySizeDto) {
    return this.companySizeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all company sizes with pagination and search' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: QueryCompanySizeDto) {
    return this.companySizeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company size by ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.companySizeService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company size' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  update(@Param('id') id: string, @Body() dto: UpdateCompanySizeDto) {
    return this.companySizeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a company size' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  remove(@Param('id') id: string) {
    return this.companySizeService.remove(id);
  }

  @Post(':id/set-default')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set a company size as default' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  setDefault(@Param('id') id: string) {
    return this.companySizeService.setDefault(id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get the default company size' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getDefault() {
    return this.companySizeService.getDefault();
  }
}
