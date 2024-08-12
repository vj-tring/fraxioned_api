import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Properties } from 'src/main/entities/properties.entity';
import { IsValidIdArray } from 'src/main/commons/guards/is-valid-id-list.decorator';

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
  startDate: Date;

  @ApiProperty({
    example: '2024-08-03',
  })
  @IsNotEmpty({ message: 'end date is required' })
  endDate: Date;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id property (id >= 1)',
  })
  createdBy: User;

  @ApiProperty({
    example: [{ id: 1 }, { id: 2 }],
  })
  @IsValidIdArray({
    message: 'Each property in the array must have a valid id (id >= 1)',
  })
  properties: Properties[];
}
