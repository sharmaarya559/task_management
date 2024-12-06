import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ default: '', lowercase: true })
  first_name: string;

  @Prop({ default: '', lowercase: true })
  last_name: string;

  @Prop({ default: '', collation: { locale: 'en', strength: 2 } })
  username: string;

  @Prop({ default: '', collation: { locale: 'en', strength: 2 } })
  email: string;

  @Prop()
  phone_number: string;

  @Prop({ default: '' })
  password: string;

  @Prop({ enum: ['user', 'manager'], default: 'user' })
  role: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: '' })
  country: string;

  @Prop({ default: '+91' })
  country_phone_code: string;

  @Prop({ default: null })
  deleted_at: Date;

  @Prop({ default: false })
  is_blocked: boolean;

  @Prop({ default: null })
  last_login: Date;

  @Prop({ enum: ['AR', 'EN'], default: 'EN' })
  lang: string;

  @Prop({ default: null })
  email_verified_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
