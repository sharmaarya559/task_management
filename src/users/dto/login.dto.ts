import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ required: true, type: String })
  @IsString({ message: 'Email or username must be string.' })
  @IsNotEmpty({ message: 'Email or username is required.' })
  email_or_username: string;

  @ApiProperty({ required: true, type: String })
  @IsString({ message: 'Password must be string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
