import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class BulkOperationDto {
  @ApiProperty({
    description: 'Array of lead IDs to perform bulk operation on',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  leadIds: string[];

  @ApiProperty({
    description: 'User who deleted the lead',
    example: 'admin@gamyam.ai',
  })
  @IsString()
  @IsNotEmpty()
  deletedBy: string;
}

export class BulkUpdateDto {
  @ApiProperty({
    description: 'Array of lead IDs to update',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  leadIds: string[];

  @ApiPropertyOptional({ description: 'Lead owner name' })
  @IsOptional()
  @IsString()
  leadOwner?: string;

  @ApiPropertyOptional({ enum: ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Mx'] })
  @IsOptional()
  @IsEnum(['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Mx'])
  salutation?: string;

  @ApiPropertyOptional({ description: 'Lead status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Sequence Name' })
  @IsOptional()
  @IsString()
  sequenceName?: string;

  @ApiPropertyOptional({ description: 'Lead source' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Lead score (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({
    description: 'Lead score trend',
    enum: ['up', 'down', 'stable'],
  })
  @IsOptional()
  @IsEnum(['up', 'down', 'stable'])
  scoreTrend?: string;

  @ApiPropertyOptional({
    description: 'Preferred communication channel',
    enum: ['email', 'phone', 'sms', 'whatsapp'],
  })
  @IsOptional()
  @IsEnum(['email', 'phone', 'sms', 'whatsapp'])
  preferredChannel?: string;

  @ApiPropertyOptional({
    description: 'Next stage in the sales pipeline',
  })
  @IsOptional()
  @IsString()
  nextStage?: string;

  @ApiPropertyOptional({
    description: 'Annual revenue in USD',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualRevenue?: number;

  @ApiPropertyOptional({ description: 'User who updated the lead' })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiPropertyOptional({ description: 'Is lead archived' })
  @IsOptional()
  isArchived?: boolean;
}
