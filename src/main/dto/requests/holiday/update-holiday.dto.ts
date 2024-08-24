import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../../entities/property.entity';
import { IsValidIdArray } from 'src/main/commons/guards/is-valid-id-list.decorator';

export class UpdateHolidayDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  year: number;

  @ApiProperty({
    example: '2024-08-03',
  })
  @IsOptional()
  startDate: Date;

  @ApiProperty({
    example: '2024-08-03',
  })
  @IsOptional()
  endDate: Date;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;

  @ApiProperty({
    example: [{ id: 1 }, { id: 2 }],
  })
  @IsValidIdArray({
    message: 'Each property in the array must have a valid id (id >= 1)',
  })
  properties: Property[];
}
