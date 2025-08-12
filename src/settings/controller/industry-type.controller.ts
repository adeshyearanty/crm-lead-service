import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IndustryTypeService } from '../service/industry-type.service';
import { CreateIndustryTypeDto } from '../dto/industry-type/create-industry-type.dto';
import { QueryIndustryTypeDto } from '../dto/industry-type/query-industry-type.dto';
import { UpdateIndustryTypeDto } from '../dto/industry-type/update-industry-type.dto';

@ApiTags('Industry Types')
@Controller({
  version: '1',
  path: 'industry-types',
})
export class IndustryTypeController {
  constructor(private readonly service: IndustryTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new industry type' })
  @ApiResponse({
    status: 201,
    description: 'Industry type created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Industry type with this name already exists',
  })
  create(@Body() dto: CreateIndustryTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all industry types with pagination and search',
  })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: QueryIndustryTypeDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an industry type by ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an industry type' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  update(@Param('id') id: string, @Body() dto: UpdateIndustryTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an industry type' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/set-default')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set an industry type as default' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  setDefault(@Param('id') id: string) {
    return this.service.setDefault(id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get the default industry type' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getDefault() {
    return this.service.getDefault();
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get the number of leads using this industry type' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getUsageCount(@Param('id') id: string) {
    return this.service.getUsageCount(id);
  }
}
