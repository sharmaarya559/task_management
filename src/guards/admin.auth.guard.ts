import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from 'src/exception/custom.exception';
import { Admin, AdminDocument } from 'src/schema/admin.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const request = context?.switchToHttp()?.getRequest();
      if (!request?.headers || !request?.headers?.authorization) {
        throw new UnauthorizedException('Authetication failed.');
      }
      const token = request?.headers?.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Authetication failed.');
      }
      const decode = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      if (!decode) {
        throw new UnauthorizedException('Authetication failed.');
      }
      if (decode?.role && decode?.role === 'admin') {
        const admin = await this.adminModel
          .findById(decode?.id)
          .select({ password: 0 });
        if (!admin) {
          throw new UnauthorizedException('Authetication failed.');
        }
        request['admin'] = admin;
        return true;
      } else {
        throw new UnauthorizedException('Authetication failed.');
      }
    } catch (error) {
      throw new CustomException(error, error?.status);
    }
  }
}
