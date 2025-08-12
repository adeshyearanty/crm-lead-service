import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class CreateLeadStatusDto {
  @ApiProperty({
    description: 'Name of the lead status',
    example: 'New',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message:
      'Lead status name must be alphanumeric and can only contain spaces or hyphens',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Whether this should be set as the default lead status',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
