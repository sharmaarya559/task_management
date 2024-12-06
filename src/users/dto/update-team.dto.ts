import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsOptional,
} from "class-validator";

export class UpdateTeamDto {
  @ApiProperty({ required: true, type: Array<string> })
  @IsArray({ message: `Users must be array of string.` })
  @IsOptional()
  users: Array<string>;
}
