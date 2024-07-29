import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsDate,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Users } from 'src/entities/users.entity';

export class UpdateHolidayDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  year: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate: Date;

  @IsNotEmpty({ message: 'updated by is required' })
  @ApiProperty({ type: Users })
  @ValidateNested()
  @Type(() => Users)
  updatedBy: Users;
}
