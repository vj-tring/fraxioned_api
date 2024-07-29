import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Users } from 'src/entities/users.entity';

export class CreateHolidayDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'holiday name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'year is required' })
  @ApiProperty()
  @IsNumber()
  year: number;

  @IsNotEmpty({ message: 'start date is required' })
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty({ message: 'end date is required' })
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsNotEmpty({ message: 'created by is required' })
  @ApiProperty({ type: Users })
  @ValidateNested()
  @Type(() => Users)
  createdBy: Users;
}
