import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateLeadStatusDto {
  @ApiPropertyOptional({
    description: 'Name of the lead status',
    example: 'New',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message:
      'Lead status name must be alphanumeric and can only contain spaces or hyphens',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Whether this should be set as the default lead status',
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
