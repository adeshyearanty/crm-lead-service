import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class CreateIndustryTypeDto {
  @ApiProperty({
    description: 'Name of the industry type',
    example: 'Software',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message:
      'Industry type name must be alphanumeric and can only contain spaces or hyphens',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Whether this should be set as the default industry type',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
