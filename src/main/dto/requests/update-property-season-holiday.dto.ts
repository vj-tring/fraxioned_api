import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { Properties } from 'entities/properties.entity';
import { Holidays } from 'entities/holidays.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { User } from 'entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePropertySeasonHolidayDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsOptional()
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Properties;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsOptional()
  @IsValidId({
    message: 'holiday must be an object with a valid id where (id >= 1)',
  })
  holiday: Holidays;

  @IsOptional()
  @IsBoolean()
  isPeakSeason: boolean;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
