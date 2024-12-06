import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from 'src/schema/admin.schema';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from 'src/schema/user.schema';
import { Task, TaskSchema } from 'src/schema/task.schema';
import {
  Map_User_Task,
  Map_User_Task_Schema,
} from 'src/schema/map-user-task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Map_User_Task.name, schema: Map_User_Task_Schema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtService],
})
export class AdminModule {}
