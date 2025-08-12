import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OptionalTransformArray } from 'src/common/decorators/optional-transform.decorator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SortingDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class PaginationDto extends SortingDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ColumnSelectionDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Columns to display in the response',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @OptionalTransformArray()
  columnsToDisplay?: string[] = [];

  @ApiPropertyOptional({
    description: 'Columns to include in search',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @OptionalTransformArray()
  columnsToSearch?: string[] = [];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
