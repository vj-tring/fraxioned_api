import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Users } from 'src/entities/users.entity';

export class CreateHolidayDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'holiday name is required' })
  name: string;

  @IsNotEmpty({ message: 'year is required' })
  @ApiProperty()
  year: number;

  @IsNotEmpty({ message: 'start date is required' })
  @ApiProperty()
  startDate: Date;

  @IsNotEmpty({ message: 'end date is required' })
  @ApiProperty()
  endDate: Date;

  @IsNotEmpty({ message: 'created at is required' })
  @ApiProperty()
  createdAt: Date;

  @IsNotEmpty({ message: 'updated at is required' })
  @ApiProperty()
  updatedAt: Date;

  @IsNotEmpty({ message: 'created by is required' })
  @ApiProperty()
  createdBy: Users;

  @IsNotEmpty({ message: 'updated by is required' })
  @ApiProperty()
  updatedBy: Users;
}
