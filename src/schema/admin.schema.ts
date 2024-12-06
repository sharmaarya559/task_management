import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Admin {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ enum: ['EN', 'AR'], default: 'EN' })
  lang: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
export type AdminDocument = Admin & Document;
