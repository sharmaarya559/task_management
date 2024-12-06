import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ChangeTaskStatusDto {
  @ApiProperty({ required: true, type: String, enum: ["ongoing", "completed"] })
  @IsString({ message: "Status must be of string type." })
  @IsNotEmpty({ message: "Status is required." })
  status: string;
}
