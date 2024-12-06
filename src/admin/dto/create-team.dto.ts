import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateTeamDto {
  @ApiProperty({ required: true, type: String })
  @IsString({ message: `Manager's id must be string.` })
  @IsMongoId()
  @IsNotEmpty({ message: `Manager's id is required.` })
  manager_id: string;

  @ApiProperty({ required: true, type: Array<string> })
  @IsArray({ message: `Users must be array of string.` })
  @IsNotEmpty({ message: `Users are required.` })
  users: Array<string>;
}
