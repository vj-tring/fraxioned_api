import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { Holidays } from 'src/main/entities/holidays.entity';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export class UpdatePropertySeasonHolidayDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'property ID is required' })
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'holiday ID is required' })
  @IsValidId({
    message: 'holiday must be an object with a valid id where (id >= 1)',
  })
  holiday: Holidays;

  @IsNotEmpty({ message: 'Is peak season setting is required' })
  @IsBoolean()
  isPeakSeason: boolean;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
