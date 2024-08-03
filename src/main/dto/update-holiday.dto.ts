import {
  IsNumber,
  IsString,
  IsDate,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '../entities/user.entity';
import { IsValidId } from '../commons/guards/is-valid-id.decorator';

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
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
