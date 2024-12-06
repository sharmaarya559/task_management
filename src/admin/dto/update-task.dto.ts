import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({ required: false, type: String })
  @IsString({ message: 'Title must be a string.' })
  @IsOptional()
  title: string;

  @ApiProperty({ required: false, type: String })
  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  description: string;

  @ApiProperty({ required: false, type: Boolean })
  @IsBoolean({ message: 'Priority must be a boolean.' })
  @IsOptional()
  priority: boolean;

  @ApiProperty({ required: false, type: String })
  @IsString({ message: 'Due date be a string.' })
  @IsOptional()
  due_date: string;
}
