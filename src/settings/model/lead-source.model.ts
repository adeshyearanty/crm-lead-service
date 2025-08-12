import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LeadSource extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, default: false })
  isDefault: boolean;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const LeadSourceSchema = SchemaFactory.createForClass(LeadSource);
