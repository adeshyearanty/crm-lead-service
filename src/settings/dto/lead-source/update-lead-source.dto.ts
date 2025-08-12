import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateLeadSourceDto {
  @ApiPropertyOptional({
    description: 'Name of the lead source',
    example: 'Website Form',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message:
      'Lead source name must be alphanumeric and can only contain spaces or hyphens',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Whether this should be set as the default lead source',
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
