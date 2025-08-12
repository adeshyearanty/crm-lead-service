import { ApiProperty } from '@nestjs/swagger';
import { IndustryType } from '../../model/industry-type.model';

export class PaginatedIndustryTypeResponseDto {
  @ApiProperty({ type: [IndustryType] })
  items: IndustryType[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
