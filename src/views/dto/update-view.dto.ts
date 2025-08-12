import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FilterConditionDto } from '../../leads/dto/advanced-filters.dto';
import { SortOrder } from 'src/leads/dto/pagination.dto';

export class UpdateViewDto {
  @ApiPropertyOptional({
    description: 'Name of the custom view',
    example: 'High Score Leads',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Advanced filters to apply to the view',
    type: [FilterConditionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterConditionDto)
  filters?: FilterConditionDto[];

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'score',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({
    description: 'Whether this is the default view',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'List of columns to display in this view',
    example: ['fullName', 'email', 'status', 'score'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columnsToDisplay?: string[];
}
