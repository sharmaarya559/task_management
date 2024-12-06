import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Map_User_Task {
  @Prop({ enum: ['user', 'manager'], default: 'user' })
  assigned_by: string;

  @Prop()
  manager_id: mongoose.Types.ObjectId;

  @Prop()
  assigned_to: mongoose.Types.ObjectId;

  @Prop()
  task_id: mongoose.Types.ObjectId;

  @Prop({ enum: ['pending', 'ongoing', 'completed'], default: 'pending' })
  status: string;

  @Prop({ default: null })
  completed_at: Date;
}

export const Map_User_Task_Schema = SchemaFactory.createForClass(Map_User_Task);
export type Map_User_Task_Document = Map_User_Task & Document;
