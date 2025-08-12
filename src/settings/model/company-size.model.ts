import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
  Matches,
} from 'class-validator';

@Schema({ timestamps: true })
export class CompanySize extends Document {
  @ApiProperty({
    description: 'Label for the company size (e.g., "Startup", "SME")',
    example: 'Startup',
  })
  @Prop({ required: true })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message: 'Label can only contain letters, numbers, spaces, and hyphens',
  })
  label: string;

  @ApiPropertyOptional({
    description: 'Employee range (e.g., "0-50", "51-200")',
    example: '0-50',
  })
  @Prop()
  @IsOptional()
  @IsString()
  @Matches(/^\d+-\d+$/, {
    message: 'Employee range must be in format "min-max" (e.g., "0-50")',
  })
  employeeRange?: string;

  @ApiProperty({
    description: 'Whether this is the default company size',
    default: false,
  })
  @Prop({ default: false })
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @IsDate()
  updatedAt: Date;
}

export const CompanySizeSchema = SchemaFactory.createForClass(CompanySize);
