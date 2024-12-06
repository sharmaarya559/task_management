import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schema/user.schema";
import { Otp, OtpSchema } from "src/schema/otp.schema";
import {
  Token_Authentication,
  Token_Authentication_Schema,
} from "src/schema/token-authentication.schema";
import { JwtService } from "@nestjs/jwt";
import { Attachment, AttachmentSchema } from "src/schema/attachment.schema";
import {
  Map_User_Task,
  Map_User_Task_Schema,
} from "src/schema/map-user-task.schema";
import { Team, TeamSchema } from "src/schema/team.schema";
import { Task, TaskSchema } from "src/schema/task.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Token_Authentication.name, schema: Token_Authentication_Schema },
      { name: Attachment.name, schema: AttachmentSchema },
      { name: Map_User_Task.name, schema: Map_User_Task_Schema },
      { name: Team.name, schema: TeamSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
})
export class UsersModule {}
