import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Token_Authentication {
  @Prop()
  user_id: string;

  @Prop()
  iat: number;
}

export const Token_Authentication_Schema =
  SchemaFactory.createForClass(Token_Authentication);
export type Token_Authentication_Document = Token_Authentication & Document;
