import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Otp {
  @Prop()
  email: string;

  @Prop()
  phone_number: string;

  @Prop({ enum: ['verify_email'] })
  action: string;

  @Prop()
  otp: number;

  @Prop()
  expired_at: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
export type OtpDocument = Otp & Document;
