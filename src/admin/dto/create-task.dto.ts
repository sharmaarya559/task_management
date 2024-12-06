import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ required: true, type: String })
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @ApiProperty({ required: true, type: String })
  @IsString({ message: 'Description must be a string.' })
  @IsNotEmpty({ message: 'Description must be a string.' })
  description: string;

  @ApiProperty({ required: true, type: Boolean })
  @IsBoolean({ message: 'Priority must be a boolean.' })
  @IsNotEmpty({ message: 'Priority must be a string.' })
  priority: boolean;

  @ApiProperty({ required: true, type: String })
  @IsString({ message: 'Due date be a string.' })
  @IsNotEmpty({ message: 'Due date must be a string.' })
  due_date: string;
}
