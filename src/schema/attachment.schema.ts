import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Attachment {
  @Prop({ type: mongoose.Types.ObjectId })
  user_id: User;

  @Prop({ default: '' })
  type: string;

  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  file_name: string;

  @Prop({ default: '' })
  mime_type: string;

  @Prop({ default: '' })
  path: string;

  @Prop({ default: '' })
  base_url: string;

  @Prop({ default: '' })
  originalName: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
export type AttachmentDocument = Attachment & Document;
