import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class Team {
  @Prop()
  manager_id: mongoose.Types.ObjectId;

  @Prop()
  users: [mongoose.Types.ObjectId];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
export type TeamDocument = Team & Document;
