import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Otp, OtpDocument } from 'src/schema/otp.schema';
import {
  Token_Authentication,
  Token_Authentication_Document,
} from 'src/schema/token-authentication.schema';
import { CustomException } from 'src/exception/custom.exception';
import { SignupDto } from 'src/users/dto/signup.dto';
import {
  ErrorMessages,
  SuccessMessages,
} from 'src/utils/response-message.helper';
import { VerifyOtpDto } from 'src/users/dto/verify-otp.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/users/dto/login.dto';
import { Attachment, AttachmentDocument } from 'src/schema/attachment.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    @InjectModel(Token_Authentication.name)
    private readonly authModel: Model<Token_Authentication_Document>,
    private readonly jwtService: JwtService,
    @InjectModel(Attachment.name)
    private readonly attachmentModel: Model<AttachmentDocument>,
  ) {}

  /***************************SIGNUP*****************************/
  async signup(lang: string, body: SignupDto, res: Response) {
    try {
      if (body?.password !== body?.confirm_password) {
        throw new BadRequestException(
          ErrorMessages?.BOTH_PASSWORD_MATCH[lang || 'EN'],
        );
      }
      const findUser = await this.userModel.findOne({
        $or: [{ username: body?.username }, { email: body?.email }],
      });
      if (findUser) {
        throw new BadRequestException(ErrorMessages?.USER_EXIST[lang || 'EN']);
      }
      const hashedPassword = await bcrypt.hash(body?.password, 10);
      await new this.userModel({
        ...body,
        password: hashedPassword,
      }).save();
      await new this.otpModel({
        email: body?.email,
        action: 'verify_email',
        otp: 123456,
        expired_at: new Date(new Date().getTime() + 5 * 60 * 1000),
      }).save();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.OTP_SENT[lang || 'EN'],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /***************************VERIFY OTP*****************************/
  async verifyOtp(lang: string, body: VerifyOtpDto, res: Response) {
    try {
      const user = await this.userModel
        .findOne({ email: body?.email })
        .select({ password: 0 });
      if (!user) {
        throw new BadRequestException(
          ErrorMessages?.EMAIL_NOT_EXIST[lang || 'EN'],
        );
      }
      const findOtp = await this.otpModel.findOne({
        email: body?.email,
        action: body?.action,
        expired_at: { $gte: new Date() },
      });
      if (!findOtp) {
        throw new BadRequestException(
          ErrorMessages?.OTP_NOT_FOUND[lang || 'EN'],
        );
      }
      if (findOtp?.otp !== body.otp) {
        throw new BadRequestException(
          ErrorMessages?.WRONG_OTP_ENTERED[lang || 'EN'],
        );
      }
      const token = await this.jwtService.sign(
        { id: user?._id, role: 'user' },
        { secret: process.env.JWT_SECRET_KEY, expiresIn: '24h' },
      );
      const decode = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      await new this.authModel({
        user_id: new mongoose.Types.ObjectId(user?._id),
        iat: decode?.iat,
      }).save();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.OTP_VERIFIED[lang || 'EN'],
        token,
        user,
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /***************************LOGIN*********************************/
  async login(lang: string, body: LoginDto, res: Response) {
    try {
      const user = await this.userModel.findOne({
        $or: [
          { email: body?.email_or_username },
          { username: body?.email_or_username },
        ],
      });
      if (!user) {
        throw new BadRequestException(
          ErrorMessages?.USER_NOT_EXIST[lang || 'EN'],
        );
      }
      const matchPassword = await bcrypt.compare(
        body?.password,
        user?.password,
      );
      if (!matchPassword) {
        throw new BadRequestException(
          ErrorMessages?.INVALID_CREDENTIALS[lang || 'EN'],
        );
      }
      if (user?.is_blocked) {
        throw new BadRequestException(
          ErrorMessages?.ACCOUNT_BLOCKED[lang || 'EN'],
        );
      }
      const token = await this.jwtService.sign(
        { id: user?._id, role: user?.role },
        { secret: process.env.JWT_SECRET_KEY, expiresIn: '24h' },
      );
      const decode = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      const findAuth = await this.authModel.findOne({
        user_id: new mongoose.Types.ObjectId(user?._id),
      });
      if (findAuth) {
        await this.authModel.findByIdAndDelete(findAuth?._id, {
          iat: decode?.iat,
        });
      } else {
        await new this.authModel({
          user_id: new mongoose.Types.ObjectId(user?._id),
          iat: decode?.iat,
        }).save();
      }
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.LOGIN_SUCCESSFULL[lang || 'EN'],
        token,
        user,
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /***************************LOG OUT*******************************/
  async logout(req: Request, lang: string, res: Response) {
    try {
      await this.authModel.findOneAndDelete({
        user_id: new mongoose.Types.ObjectId(req['user']['_id']),
      });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.LOGOUT_SUCCESSFULL[lang || 'EN'],
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /***********************UPLOAD PROFILE PICTURE********************/
  async uploadProfilePicture(
    req: Request,
    lang: string,
    file: Express.Multer.File,
    res: Response,
  ) {
    try {
      if (!file) {
        throw new BadRequestException(
          ErrorMessages?.IMAGE_REQUIRED[lang || 'EN'],
        );
      }
      if (req['fileValidationError']) {
        throw new BadRequestException(req['fileValidationError']);
      }
      await new this.attachmentModel({
        name: file?.fieldname,
        file_name: file?.filename,
        original_name: file?.originalname,
        mime_type: file?.mimetype,
        type: 'document',
        user_id: new mongoose.Types.ObjectId(req['user']['_id']),
        path: file?.path,
        base_url: `${req.protocol}://${req.headers.host}/`,
        uploaded_by: 'user',
      }).save();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.PROFILE_UPLOADED[lang || 'EN'],
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /****************************GET PROFILE**************************/
  async getProfile(req: Request, res: Response) {
    try {
      const user = req['user'];
      delete user?._doc?.password;
      return res.status(HttpStatus.CREATED).json({
        success: true,
        user,
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /****************************GET MY TASKS**************************/
  async getMyTasks(req: Request, res: Response) {
    try {
      const user = req['user'];
      delete user?._doc?.password;
      return res.status(HttpStatus.CREATED).json({
        success: true,
        user,
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }
}
