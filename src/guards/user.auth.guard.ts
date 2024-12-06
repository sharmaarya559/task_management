import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from 'src/exception/custom.exception';
import {
  Token_Authentication,
  Token_Authentication_Document,
} from 'src/schema/token-authentication.schema';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    @InjectModel(Token_Authentication.name)
    private readonly authModel: Model<Token_Authentication_Document>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const request = context.switchToHttp().getRequest();
      if (!request?.headers || !request?.headers?.authorization) {
        throw new UnauthorizedException('Authetication failed.');
      }
      const token = request.headers.authorization.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Authetication failed.');
      }
      const decode = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      if (!decode) {
        throw new UnauthorizedException('Authetication failed.');
      }
      if (decode?.role && decode?.role === 'user') {
        const user = await this.userModel.findById(decode?.id);
        if (!user) {
          throw new UnauthorizedException('Authetication failed.');
        }
        const findAuth = await this.authModel.findOne({
          user_id: new mongoose.Types.ObjectId(decode?.id),
          iat: decode?.iat,
        });
        if (!findAuth) {
          throw new UnauthorizedException('Authetication failed.');
        }
        request['user'] = user;
        return true;
      } else {
        throw new UnauthorizedException('Authetication failed.');
      }
    } catch (error) {
      throw new CustomException(error, error?.status);
    }
  }
}
