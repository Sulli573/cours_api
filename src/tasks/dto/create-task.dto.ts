import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsIn(['todo', 'in-progress', 'done'])
  status?: 'todo' | 'in-progress' | 'done';

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}