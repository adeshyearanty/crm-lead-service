import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateCompanySizeDto {
  @ApiProperty({
    description: 'Label for the company size (e.g., "Startup", "SME")',
    example: 'Startup',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message: 'Label can only contain letters, numbers, spaces, and hyphens',
  })
  label: string;

  @ApiPropertyOptional({
    description: 'Employee range (e.g., "0-50", "51-200")',
    example: '0-50',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o: CreateCompanySizeDto) => o.employeeRange !== '')
  @Matches(/^\d+-\d+$/, {
    message: 'Employee range must be in format "min-max" (e.g., "0-50")',
  })
  employeeRange?: string;

  @ApiPropertyOptional({
    description: 'Whether this is the default company size',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
