import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateLeadDto } from './create-leads.dto';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiProperty({
    description: 'User ID who updated the lead',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  updatedBy: string;
}
