import {
  IsNumber,
  IsString,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UpdateHolidayDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  year: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate: Date;

  @IsNotEmpty({ message: 'updated by is required' })
  @IsInt()
  @Min(1)
  updatedBy: User;
}
