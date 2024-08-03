import { IsBoolean, IsNotEmpty } from 'class-validator';
import { Properties } from '../entities/properties.entity';
import { Holidays } from '../entities/holidays.entity';
import { IsValidId } from '../commons/guards/is-valid-id.decorator';
import { User } from '../entities/user.entity';

export class CreatePropertySeasonHolidayDto {
  @IsNotEmpty({ message: 'property ID is required' })
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Properties;

  @IsNotEmpty({ message: 'holiday ID is required' })
  @IsValidId({
    message: 'holiday must be an object with a valid id where (id >= 1)',
  })
  holiday: Holidays;

  @IsNotEmpty({ message: 'Is peak season setting is required' })
  @IsBoolean()
  isPeakSeason: boolean;

  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}
