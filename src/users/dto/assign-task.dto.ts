import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class AssignTaskDto {
  @ApiProperty({ required: true, type: String })
  @IsString({ message: `User's id must be string.` })
  @IsMongoId()
  @IsNotEmpty({ message: `User's id is required.` })
  user_id: string;

  @ApiProperty({ required: true, type: String })
  @IsString({ message: `Task id must be string.` })
  @IsMongoId()
  @IsNotEmpty({ message: `Task id is required.` })
  task_id: string;
}
