import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SignupDto } from 'src/users/dto/signup.dto';
import { VerifyOtpDto } from 'src/users/dto/verify-otp.dto';
import { LoginDto } from 'src/users/dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, mediaFileFilter } from 'src/utils/file-upload.helper';
import { UserGuard } from 'src/guards/user.auth.guard';

@ApiTags('Users Api')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /***************************SIGNUP*****************************/
  @ApiOperation({ summary: 'Users Signup' })
  @Post('signup')
  async signup(
    @Headers('Content-Language') lang: string,
    @Body() body: SignupDto,
    @Res() res: Response,
  ) {
    return await this.usersService.signup(lang, body, res);
  }

  /***************************VERIFY OTP*****************************/
  @ApiOperation({ summary: 'Verify Otp' })
  @Post('verify_otp')
  async verifyOtp(
    @Headers('Content-Language') lang: string,
    @Body() body: VerifyOtpDto,
    @Res() res: Response,
  ) {
    return await this.usersService.verifyOtp(lang, body, res);
  }

  /***************************LOGIN*********************************/
  @ApiOperation({ summary: 'Login' })
  @Post('login')
  async login(
    @Headers('Content-Language') lang: string,
    @Body() body: LoginDto,
    @Res() res: Response,
  ) {
    return await this.usersService.login(lang, body, res);
  }

  /***************************LOG OUT*******************************/
  @ApiOperation({ summary: 'Logout' })
  @Post('logout')
  @UseGuards(UserGuard)
  async logout(
    @Req() req: Request,
    @Headers('Content-Language') lang: string,
    @Res() res: Response,
  ) {
    return await this.usersService.logout(req, lang, res);
  }

  /***********************UPLOAD PROFILE PICTURE********************/
  @ApiOperation({ summary: 'Upload Profile Picture' })
  @Post('upload_profile')
  @UseGuards(UserGuard)
  @UseInterceptors(
    FileInterceptor('profile', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: mediaFileFilter,
    }),
  )
  async uploadProfilePicture(
    @Req() req: Request,
    @Headers('Content-Language') lang: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    return await this.usersService.uploadProfilePicture(req, lang, file, res);
  }

  /****************************GET PROFILE**************************/
  @ApiOperation({ summary: 'Get Profile' })
  @Get('get_profile')
  @UseGuards(UserGuard)
  async getProfile(
    @Req() req: Request,
    @Headers('Content-Language') lang: string,
    @Res() res: Response,
  ) {
    return await this.usersService.getProfile(req, res);
  }

  /****************************GET MY TASKS**************************/
  @ApiOperation({ summary: 'Get My Tasks' })
  @Get('get_my_tasks')
  @UseGuards(UserGuard)
  async getMyTasks(
    @Req() req: Request,
    @Headers('Content-Language') lang: string,
    @Res() res: Response,
  ) {
    return await this.usersService.getMyTasks(req, res);
  }
}
