import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';
import { Otp, OtpSchema } from 'src/schema/otp.schema';
import {
  Token_Authentication,
  Token_Authentication_Schema,
} from 'src/schema/token-authentication.schema';
import { JwtService } from '@nestjs/jwt';
import { Attachment, AttachmentSchema } from 'src/schema/attachment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Token_Authentication.name, schema: Token_Authentication_Schema },
      { name: Attachment.name, schema: AttachmentSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
})
export class UsersModule {}
