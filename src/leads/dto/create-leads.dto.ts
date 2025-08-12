import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { OptionalTransform } from 'src/common/decorators/optional-transform.decorator';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Lead Owner Name',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  leadOwner: string;

  @ApiProperty({
    description: 'Full name of the lead',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({
    enum: ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Mx'],
    description: 'Salutation',
  })
  @IsOptional()
  @IsEnum(['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Mx'])
  @OptionalTransform()
  salutation?: string;

  @ApiProperty({
    description: 'Email address',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    },
    {
      message: 'Website must be a valid URL starting with http:// or https://',
    },
  )
  @OptionalTransform()
  website?: string;

  @ApiPropertyOptional({
    description: 'Contact number country code',
  })
  @IsOptional()
  @IsString()
  @Length(2, 4)
  @Matches(/^\+\d{1,3}$/, {
    message: 'Country code must start with + followed by 1-3 digits',
  })
  @OptionalTransform()
  contactCountryCode?: string;

  @ApiPropertyOptional({ description: 'Contact number', maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^\d{10}$/, {
    message: 'Contact number must be exactly 10 digits',
  })
  @OptionalTransform()
  contactNumber?: string;

  @ApiPropertyOptional({ description: 'Contact extension', maxLength: 6 })
  @IsOptional()
  @IsString()
  @Length(1, 6)
  @Matches(/^\d{1,6}$/, {
    message: 'Extension must be 1-6 digits',
  })
  @OptionalTransform()
  contactExtension?: string;

  @ApiPropertyOptional({
    description: 'Alternate number country code',
  })
  @IsOptional()
  @IsString()
  @Length(2, 4)
  @Matches(/^\+\d{1,3}$/, {
    message: 'Country code must start with + followed by 1-3 digits',
  })
  @OptionalTransform()
  alternateCountryCode?: string;

  @ApiPropertyOptional({ description: 'Alternate number', maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^\d{10}$/, {
    message: 'Alternate number must be exactly 10 digits',
  })
  @OptionalTransform()
  alternateNumber?: string;

  @ApiPropertyOptional({ description: 'Alternate extension', maxLength: 6 })
  @IsOptional()
  @IsString()
  @Length(1, 6)
  @Matches(/^\d{1,6}$/, {
    message: 'Extension must be 1-6 digits',
  })
  @OptionalTransform()
  alternateExtension?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @OptionalTransform()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Designation/Job title' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  @OptionalTransform()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Company size',
  })
  @IsOptional()
  @OptionalTransform()
  companySize?: string;

  @ApiPropertyOptional({
    description: 'Industry type',
  })
  @IsOptional()
  @OptionalTransform()
  industryType?: string;

  @ApiProperty({
    description: 'Lead status',
    required: true,
  })
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Lead source',
    required: true,
  })
  @IsNotEmpty()
  source: string;

  @ApiPropertyOptional({
    description: 'Lead score (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  @OptionalTransform()
  score?: number;

  @ApiPropertyOptional({
    description: 'Lead score trend',
    enum: ['up', 'down', 'stable'],
  })
  @IsOptional()
  @IsEnum(['up', 'down', 'stable'])
  @OptionalTransform()
  scoreTrend?: string;

  @ApiPropertyOptional({
    description: 'Preferred communication channel',
    enum: ['email', 'phone', 'sms', 'whatsapp'],
  })
  @IsOptional()
  @IsEnum(['email', 'phone', 'sms', 'whatsapp'])
  @OptionalTransform()
  preferredChannel?: string;

  @ApiPropertyOptional({
    description: 'Date of last activity (ISO string or empty)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return value;
  })
  @ValidateIf(
    (obj, value) => value !== undefined && value !== null && value !== '',
  )
  @IsISO8601()
  lastActivityDate?: string;

  @ApiProperty({
    description: 'Date when lead was created',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  createdDate: Date;

  @ApiPropertyOptional({ description: 'Additional description' })
  @IsOptional()
  @OptionalTransform()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://www.linkedin.com/in/username',
  })
  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    host_whitelist: ['linkedin.com', 'www.linkedin.com'],
  })
  @OptionalTransform()
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'Twitter profile URL',
    example: 'https://x.com/username',
  })
  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    host_whitelist: ['x.com', 'www.x.com'],
  })
  @OptionalTransform()
  twitterUrl?: string;

  @ApiPropertyOptional({
    description: 'Annual revenue in USD',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @OptionalTransform()
  annualRevenue?: number;

  @ApiProperty({
    description: 'User ID who created the lead',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Lead profile image (JPEG, PNG supported, max 5MB)',
  })
  @IsOptional()
  @OptionalTransform()
  leadImage?: string;

  @ApiPropertyOptional({
    description: 'Next stage in the sales pipeline',
  })
  @IsOptional()
  @IsString()
  @OptionalTransform()
  nextStage?: string;
}
