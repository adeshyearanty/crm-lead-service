import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SortOrder } from 'src/leads/dto/pagination.dto';
import { FilterConditionDto } from '../../leads/dto/advanced-filters.dto';

export class CreateViewDto {
  @ApiProperty({
    description: 'Name of the custom view',
    example: 'High Score Leads',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Advanced filters to apply to the view',
    type: [FilterConditionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterConditionDto)
  filters: FilterConditionDto[];

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
    default: false,
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
