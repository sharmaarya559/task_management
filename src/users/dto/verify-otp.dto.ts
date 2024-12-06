import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ type: String, required: true })
  @IsString({ message: 'Action must be a string.' })
  @IsIn(['verify_email'])
  @IsNotEmpty({ message: 'Action is required.' })
  action: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty({ message: 'Otp is required.' })
  otp: number;

  @ApiProperty({ type: String, required: true })
  @IsString({ message: 'Email must be a string.' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}
