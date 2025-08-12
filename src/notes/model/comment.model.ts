import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @ApiProperty({ description: 'ID of the note this comment belongs to' })
  @Prop({ type: Types.ObjectId, ref: 'Note', required: true })
  noteId: Types.ObjectId;

  @ApiProperty({ description: 'Content of the comment' })
  @Prop({ required: true, type: String, maxlength: 1000 })
  content: string;

  @ApiProperty({ description: 'ID of the user who created the comment' })
  @Prop({ type: String, required: true })
  createdBy: string;

  @ApiProperty({ description: 'Organization ID' })
  @Prop({ type: String, required: true })
  organizationId: string;
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
