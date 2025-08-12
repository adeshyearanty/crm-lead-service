import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class CreateLeadSourceDto {
  @ApiProperty({
    description: 'Name of the lead source',
    example: 'Website Form',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message:
      'Lead source name must be alphanumeric and can only contain spaces or hyphens',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Whether this should be set as the default lead source',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
