import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsString, Matches } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class IndustryType extends Document {
  @ApiProperty({ description: 'Name of the industry type' })
  @Prop({ required: true })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message: 'Name can only contain letters, numbers, spaces, and hyphens',
  })
  name: string;

  @ApiProperty({ description: 'Whether this is the default industry type' })
  @Prop({ default: false })
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty({ description: 'When the industry type was created' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'When the industry type was last updated' })
  @IsDate()
  updatedAt: Date;
}

export const IndustryTypeSchema = SchemaFactory.createForClass(IndustryType);
