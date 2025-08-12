import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document, Schema } from 'mongoose';

export class Lead {
  @ApiProperty({ description: 'Lead owner name', required: true })
  leadOwner: string;

  @ApiProperty({ description: 'Full name of the lead', required: true })
  fullName: string;

  @ApiPropertyOptional({
    enum: ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Mx'],
    description: 'Salutation',
  })
  salutation?: string;

  @ApiProperty({ description: 'Email address', required: true })
  email: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Contact number country code',
    example: '+91',
    maxLength: 4,
  })
  contactCountryCode?: string;

  @ApiPropertyOptional({ description: 'Contact number', maxLength: 10 })
  contactNumber?: string;

  @ApiPropertyOptional({ description: 'Contact extension', maxLength: 6 })
  contactExtension?: string;

  @ApiPropertyOptional({
    description: 'Alternate number country code',
    example: '+91',
    maxLength: 4,
  })
  alternateCountryCode?: string;

  @ApiPropertyOptional({ description: 'Alternate number', maxLength: 10 })
  alternateNumber?: string;

  @ApiPropertyOptional({ description: 'Alternate extension', maxLength: 6 })
  alternateExtension?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  companyName?: string;

  @ApiPropertyOptional({ description: 'Designation/Job title' })
  designation?: string;

  @ApiPropertyOptional({
    description: 'Company size',
  })
  companySize?: string;

  @ApiPropertyOptional({
    description: 'Industry type',
  })
  industryType?: string;

  @ApiProperty({
    description: 'Lead status',
    required: true,
  })
  status: string;

  @ApiProperty({
    description: 'Lead source',
    required: true,
  })
  source: string;

  @ApiPropertyOptional({
    description: 'Sequence Name',
  })
  sequenceName?: string;

  @ApiPropertyOptional({
    description: 'Lead score (0-100)',
    minimum: 0,
    maximum: 100,
  })
  score?: number;

  @ApiPropertyOptional({
    description: 'Lead score trend (up, down, stable)',
    enum: ['up', 'down', 'stable'],
  })
  scoreTrend?: string;

  @ApiPropertyOptional({
    description: 'Preferred communication channel',
    enum: ['email', 'phone', 'sms', 'whatsapp'],
  })
  preferredChannel?: string;

  @ApiPropertyOptional({
    description: 'Date of last activity',
    type: Date,
  })
  lastActivityDate?: Date;

  @ApiProperty({ description: 'Date when lead was created', required: true })
  createdDate: Date;

  @ApiPropertyOptional({
    description: 'Next stage in the sales pipeline',
  })
  nextStage?: string;

  @ApiPropertyOptional({ description: 'Lead profile image ID' })
  leadImage?: string;

  @ApiPropertyOptional({ description: 'Additional description' })
  description?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'Twitter profile URL' })
  twitterUrl?: string;

  @ApiPropertyOptional({ description: 'Annual revenue in USD' })
  annualRevenue?: number;

  @ApiPropertyOptional({ description: 'User who updated the lead' })
  updatedBy?: string;

  @ApiPropertyOptional({ description: 'User who created the lead' })
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Creation timestamp' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Last update timestamp' })
  updatedAt?: Date;

  @ApiPropertyOptional({ description: 'Whether the lead is archived' })
  isArchived?: boolean;
}

export interface LeadDocument extends Document {
  leadOwner: string;
  fullName: string;
  salutation?: 'Mr' | 'Ms' | 'Mrs' | 'Dr' | 'Prof' | 'Mx';
  email: string;
  website?: string;
  contactCountryCode?: string;
  contactNumber?: string;
  contactExtension?: string;
  alternateCountryCode?: string;
  alternateNumber?: string;
  alternateExtension?: string;
  companyName?: string;
  designation?: string;
  companySize?: string;
  industryType?: string;
  status: string;
  source: string;
  sequenceName?: string;
  score?: number;
  scoreTrend?: 'up' | 'down' | 'stable';
  preferredChannel?: 'email' | 'phone' | 'sms' | 'whatsapp';
  lastActivityDate?: Date;
  createdDate: Date;
  nextStage?: string;
  leadImage?: string;
  description?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  annualRevenue?: number;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isArchived?: boolean;
  createdBy?: string;
}

export const LeadSchema = new Schema<LeadDocument>(
  {
    leadOwner: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    salutation: { type: String, enum: ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Mx'] },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    website: { type: String },
    contactCountryCode: { type: String, maxlength: 4 },
    contactNumber: { type: String, maxlength: 10 },
    contactExtension: { type: String, maxlength: 6 },
    alternateCountryCode: { type: String, maxlength: 4 },
    alternateNumber: { type: String, maxlength: 10 },
    alternateExtension: { type: String, maxlength: 6 },
    companyName: { type: String },
    designation: { type: String },
    sequenceName: { type: String },
    companySize: { type: String },
    industryType: { type: String },
    status: { type: String, required: true },
    source: { type: String, required: true },
    score: { type: Number, min: 0, max: 100 },
    scoreTrend: { type: String, enum: ['up', 'down', 'stable'] },
    preferredChannel: {
      type: String,
      enum: ['email', 'phone', 'sms', 'whatsapp'],
    },
    lastActivityDate: { type: Date },
    createdDate: { type: Date, required: true },
    nextStage: { type: String },
    leadImage: { type: String },
    description: { type: String },
    linkedinUrl: { type: String },
    twitterUrl: { type: String },
    annualRevenue: { type: Number },
    updatedBy: { type: String },
    createdBy: { type: String },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'leads',
  },
);
