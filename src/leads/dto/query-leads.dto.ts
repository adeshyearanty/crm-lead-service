import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ColumnSelectionDto } from './pagination.dto';

export class QueryLeadDto extends ColumnSelectionDto {
  @ApiPropertyOptional({
    description: 'Specific field to search in',
  })
  @IsOptional()
  @IsString()
  searchBy?: string;

  @ApiPropertyOptional({
    description: 'Whether to show archived leads',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  archived?: boolean;
}
