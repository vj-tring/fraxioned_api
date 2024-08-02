import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateHolidayDto {
  @IsNotEmpty({ message: 'holiday name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'year is required' })
  @IsNumber()
  year: number;

  @IsNotEmpty({ message: 'start date is required' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty({ message: 'end date is required' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsNotEmpty({ message: 'created by is required' })
  @IsInt()
  @Min(1)
  createdBy: number;
}
