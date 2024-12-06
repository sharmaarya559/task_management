import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ type: String, required: true })
  @IsString({ message: 'Email must be string.' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({ type: String, required: true })
  @IsString({ message: 'Username must be string.' })
  @IsNotEmpty({ message: 'Username is required.' })
  username: string;

  @ApiProperty({ type: String, required: true })
  @IsString({ message: 'Password must be a string.' })
  @IsStrongPassword({ minLength: 6 })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;

  @ApiProperty({ type: String, required: true })
  @IsString({ message: 'Confirm password must be a string.' })
  @IsStrongPassword({ minLength: 6 })
  @IsNotEmpty({ message: 'Confirm Password is required.' })
  confirm_password: string;
}
