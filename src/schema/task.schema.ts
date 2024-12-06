import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Task {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  priority: boolean;

  @Prop()
  due_date: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
export type TaskDocument = Task & Document;
