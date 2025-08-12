import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Note {
  @ApiProperty({ description: 'Title of the note' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: 'ID of the lead this note belongs to' })
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true })
  leadId: Types.ObjectId;

  @ApiProperty({ description: 'Content of the note', maxLength: 10000 })
  @Prop({ required: true, type: String, maxlength: 10000 })
  content: string;

  @ApiProperty({ description: 'ID of the user who created the note' })
  @Prop({ type: String, required: true })
  createdBy: string;

  @ApiProperty({ description: 'Organization ID' })
  @Prop({ type: String, required: true })
  organizationId: string;

  @ApiPropertyOptional({ description: 'Whether the note is pinned' })
  @Prop({ default: false })
  isPinned: boolean;

  @ApiPropertyOptional({ description: 'When the note was pinned' })
  @Prop({ type: Date, default: null })
  pinnedAt: Date;

  @ApiPropertyOptional({ description: 'ID of the task created from this note' })
  @Prop({ type: Types.ObjectId, ref: 'Task' })
  createdTaskId?: Types.ObjectId;
}

export type NoteDocument = Note & Document;
export const NoteSchema = SchemaFactory.createForClass(Note);

// Create text index for search
NoteSchema.index({ content: 'text' });

// Create compound index for efficient lead-based queries
NoteSchema.index({ leadId: 1, isPinned: -1, createdAt: -1 });
