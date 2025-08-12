import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  MaxLength,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: 'Title of the note' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Content of the note', maxLength: 10000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @ApiProperty({ description: 'ID of the lead this note belongs to' })
  @IsMongoId()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ description: 'ID of the user creating the note' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional({
    description: 'Whether to create a task from this note',
  })
  @IsOptional()
  @IsBoolean()
  createTask?: boolean;

  @ApiPropertyOptional({ description: 'Due date for the task if created' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Description for the task if created' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  taskDescription?: string;
}
