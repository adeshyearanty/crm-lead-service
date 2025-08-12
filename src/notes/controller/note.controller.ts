import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NoteService } from '../service/note.service';
import { CreateNoteDto } from '../dto/create-note.dto';
import { UpdateNoteDto } from '../dto/update-note.dto';
import { NoteDocument } from '../model/note.model';
import { PaginatedResponse } from '../dto/pagination.dto';

@ApiTags('Notes')
@Controller({
  version: '1',
  path: 'notes',
})
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createDto: CreateNoteDto): Promise<NoteDocument> {
    return this.noteService.create(createDto);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get all notes for a lead with optional search' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  getByLead(
    @Param('leadId') leadId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedResponse<NoteDocument>> {
    return this.noteService.findByLead(leadId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Put(':noteId')
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('noteId') noteId: string,
    @Body() updateDto: UpdateNoteDto,
  ): Promise<NoteDocument> {
    return this.noteService.update(noteId, updateDto);
  }

  @Delete(':noteId')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  delete(
    @Param('noteId') noteId: string,
    @Query('userId') userId: string,
  ): Promise<NoteDocument> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.noteService.delete(noteId, userId);
  }

  @Put(':noteId/pin')
  @ApiOperation({ summary: 'Pin or unpin a note' })
  @ApiResponse({
    status: 200,
    description: 'Note pin status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  togglePin(
    @Param('noteId') noteId: string,
    @Query('pin') pin: boolean,
    @Query('userId') userId: string,
  ): Promise<NoteDocument> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.noteService.pin(noteId, pin, userId);
  }
}
