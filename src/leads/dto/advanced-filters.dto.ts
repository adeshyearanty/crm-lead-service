import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum FilterCondition {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  PRESET = 'preset',
  CUSTOM_RANGE = 'custom_range',
}

export enum DatePreset {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_MONTH = 'this_month',
  THIS_YEAR = 'this_year',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_180_DAYS = 'last_180_days',
  LAST_365_DAYS = 'last_365_days',
  THIS_FISCAL_YEAR = 'this_fiscal_year',
  LAST_FISCAL_YEAR = 'last_fiscal_year',
}

export class FilterConditionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({ enum: FilterCondition })
  @IsEnum(FilterCondition)
  condition: FilterCondition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  values?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  value2?: number;

  @ApiPropertyOptional({ enum: DatePreset })
  @IsOptional()
  @IsEnum(DatePreset)
  preset?: DatePreset;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class AdvancedLeadFiltersDto {
  @ApiProperty({ type: [FilterConditionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterConditionDto)
  filters: FilterConditionDto[];
}
