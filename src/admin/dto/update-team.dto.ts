import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateTeamDto {
  @ApiProperty({ required: false, type: String })
  @IsString({ message: `Manager's id must be string.` })
  @IsMongoId()
  @IsOptional()
  manager_id: string;

  @ApiProperty({ required: true, type: Array<string> })
  @IsArray({ message: `Users must be array of string.` })
  @IsOptional()
  users: Array<string>;
}
