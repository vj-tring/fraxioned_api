import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHolidayDto {
  @IsNotEmpty({ message: 'holiday name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'year is required' })
  @IsNumber()
  year: number;

  @ApiProperty({
    example: '2024-08-03',
  })
  @IsNotEmpty({ message: 'start date is required' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: '2024-08-03',
  })
  @IsNotEmpty({ message: 'end date is required' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id property (id >= 1)',
  })
  createdBy: User;
}
