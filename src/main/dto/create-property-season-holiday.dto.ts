import { IsBoolean, IsInt, IsNotEmpty, Min } from 'class-validator';
import { User } from '../entities/user.entity';
import { Properties } from '../entities/properties.entity';
import { Holidays } from '../entities/holidays.entity';

export class CreatePropertySeasonHolidayDto {
  @IsNotEmpty({ message: 'property ID is required' })
  @IsInt()
  @Min(1)
  property: Properties;

  @IsNotEmpty({ message: 'holiday ID is required' })
  @IsInt()
  @Min(1)
  holiday: Holidays;

  @IsNotEmpty({ message: 'Is peak season setting is required' })
  @IsBoolean()
  isPeakSeason: boolean;

  @IsNotEmpty({ message: 'created by is required' })
  @IsInt()
  @Min(1)
  createdBy: User;
}
