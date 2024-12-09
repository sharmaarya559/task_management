import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AdminLoginDto {
  @ApiProperty({ required: true, type: String })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  @IsNotEmpty()
  password: string;
}
