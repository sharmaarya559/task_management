import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schema/admin.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
  ) {}
  async onModuleInit() {
    const admin = await this.adminModel.find();
    if (admin.length === 0) {
      const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await new this.adminModel({
        email: process.env.ADMIN_EMAIL,
        password: password,
      }).save();
      console.log('Admin Created');
    }
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
