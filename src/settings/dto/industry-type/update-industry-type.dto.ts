import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateIndustryTypeDto {
  @ApiPropertyOptional({
    description: 'Name of the industry type',
    example: 'Software',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message:
      'Industry type name must be alphanumeric and can only contain spaces or hyphens',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Whether this should be set as the default industry type',
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
