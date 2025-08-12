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
import { CreateLeadSourceDto } from '../dto/lead-source/create-lead-source.dto';
import { QueryLeadSourceDto } from '../dto/lead-source/query-lead-source.dto';
import { UpdateLeadSourceDto } from '../dto/lead-source/update-lead-source.dto';
import { LeadSourceService } from '../service/lead-source.service';

@ApiTags('Lead Sources')
@Controller({
  version: '1',
  path: 'sources',
})
export class LeadSourceController {
  constructor(private readonly leadSourceService: LeadSourceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead source' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409 })
  create(@Body() dto: CreateLeadSourceDto) {
    return this.leadSourceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lead sources with pagination and search' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: QueryLeadSourceDto) {
    return this.leadSourceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead source by ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.leadSourceService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead source' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  update(@Param('id') id: string, @Body() dto: UpdateLeadSourceDto) {
    return this.leadSourceService.update({ id, dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lead source' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  remove(@Param('id') id: string) {
    return this.leadSourceService.delete(id);
  }

  @Post(':id/set-default')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set a lead source as default' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  setDefault(@Param('id') id: string) {
    return this.leadSourceService.setDefault(id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get the default lead source' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getDefault() {
    return this.leadSourceService.getDefault();
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get the number of leads using this source' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getUsageCount(@Param('id') id: string) {
    return this.leadSourceService.getUsageCount(id);
  }
}
