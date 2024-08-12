import { IsNotEmpty, IsInt } from 'class-validator';
import { User } from 'entities/user.entity';
import { Property } from 'entities/property.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserPropertyDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'user is required' })
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user: User;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'property is required' })
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @IsInt()
  @IsNotEmpty({ message: 'noOfShare is required' })
  noOfShare: number;

  @IsNotEmpty({ message: 'acquisitionDate is required' })
  acquisitionDate: Date;

  @IsNotEmpty({ message: 'acquisitionDate is required' })
  isActive: boolean;

  @IsInt()
  @IsNotEmpty({ message: 'year is required' })
  year?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakAllottedNights is required' })
  peakAllottedNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakUsedNights is required' })
  peakUsedNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakBookedNights is required' })
  peakBookedNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakCancelledNights is required' })
  peakCancelledNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakLostNights is required' })
  peakLostNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakRemainingNights is required' })
  peakRemainingNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakAllottedHolidayNights is required' })
  peakAllottedHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakUsedHolidayNights is required' })
  peakUsedHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakBookedHolidayNights is required' })
  peakBookedHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakRemainingHolidayNights is required' })
  peakRemainingHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakCancelledHolidayNights is required' })
  peakCancelledHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'peakLostHolidayNights is required' })
  peakLostHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offAllottedNights is required' })
  offAllottedNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offUsedNights is required' })
  offUsedNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offBookedNights is required' })
  offBookedNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offCancelledNights is required' })
  offCancelledNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offLostNights is required' })
  offLostNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offRemainingNights is required' })
  offRemainingNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offAllottedHolidayNights is required' })
  offAllottedHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offUsedHolidayNights is required' })
  offUsedHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offBookedHolidayNights is required' })
  offBookedHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offRemainingHolidayNights is required' })
  offRemainingHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offCancelledHolidayNights is required' })
  offCancelledHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'offLostHolidayNights is required' })
  offLostHolidayNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'lastMinuteAllottedNights is required' })
  lastMinuteAllottedNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'lastMinuteUsedNights is required' })
  lastMinuteUsedNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'lastMinuteBookedNights is required' })
  lastMinuteBookedNights?: number;

  @IsInt()
  @IsNotEmpty({ message: 'lastMinuteRemainingNights is required' })
  lastMinuteRemainingNights?: number;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'createdBy is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}
