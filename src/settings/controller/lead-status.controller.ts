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
import { CreateLeadStatusDto } from '../dto/lead-status/create-lead-status.dto';
import { QueryLeadStatusDto } from '../dto/lead-status/query-lead-status.dto';
import { UpdateLeadStatusDto } from '../dto/lead-status/update-lead-status.dto';
import { LeadStatusService } from '../service/lead-status.service';

@ApiTags('Lead Status')
@Controller({
  version: '1',
  path: 'statuses',
})
export class LeadStatusController {
  constructor(private readonly leadStatusService: LeadStatusService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead status' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409 })
  create(@Body() dto: CreateLeadStatusDto) {
    return this.leadStatusService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lead statuses with pagination and search' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: QueryLeadStatusDto) {
    return this.leadStatusService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead status by ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.leadStatusService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead status' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  update(@Param('id') id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.leadStatusService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lead status' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  remove(@Param('id') id: string) {
    return this.leadStatusService.delete(id);
  }

  @Post(':id/set-default')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set a lead status as default' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  setDefault(@Param('id') id: string) {
    return this.leadStatusService.setDefault(id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get the default lead status' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getDefault() {
    return this.leadStatusService.getDefault();
  }
}
