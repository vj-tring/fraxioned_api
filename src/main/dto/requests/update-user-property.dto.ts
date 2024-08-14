import { IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { User } from 'entities/user.entity';
import { Property } from 'entities/property.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPropertyDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user?: User;

  @IsOptional()
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property?: Property;

  @IsInt()
  @IsOptional()
  noOfShare?: number;

  @IsOptional()
  acquisitionDate?: Date;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsInt()
  @IsOptional()
  peakAllottedNights?: number;

  @IsInt()
  @IsOptional()
  peakUsedNights?: number;

  @IsInt()
  @IsOptional()
  peakBookedNights?: number;

  @IsInt()
  @IsOptional()
  peakCancelledNights?: number;

  @IsInt()
  @IsOptional()
  peakLostNights?: number;

  @IsInt()
  @IsOptional()
  peakRemainingNights?: number;

  @IsInt()
  @IsOptional()
  peakAllottedHolidayNights?: number;

  @IsInt()
  @IsOptional()
  peakUsedHolidayNights?: number;

  @IsInt()
  @IsOptional()
  peakBookedHolidayNights?: number;

  @IsInt()
  @IsOptional()
  peakRemainingHolidayNights?: number;

  @IsInt()
  @IsOptional()
  peakCancelledHolidayNights?: number;

  @IsInt()
  @IsOptional()
  peakLostHolidayNights?: number;

  @IsInt()
  @IsOptional()
  offAllottedNights?: number;

  @IsInt()
  @IsOptional()
  offUsedNights?: number;

  @IsInt()
  @IsOptional()
  offBookedNights?: number;

  @IsInt()
  @IsOptional()
  offCancelledNights?: number;

  @IsInt()
  @IsOptional()
  offLostNights?: number;

  @IsInt()
  @IsOptional()
  offRemainingNights?: number;

  @IsInt()
  @IsOptional()
  offAllottedHolidayNights?: number;

  @IsInt()
  @IsOptional()
  offUsedHolidayNights?: number;

  @IsInt()
  @IsOptional()
  offBookedHolidayNights?: number;

  @IsInt()
  @IsOptional()
  offRemainingHolidayNights?: number;

  @IsInt()
  @IsOptional()
  offCancelledHolidayNights?: number;

  @IsInt()
  @IsOptional()
  offLostHolidayNights?: number;

  @IsInt()
  @IsOptional()
  lastMinuteAllottedNights?: number;

  @IsInt()
  @IsOptional()
  lastMinuteUsedNights?: number;

  @IsInt()
  @IsOptional()
  lastMinuteBookedNights?: number;

  @IsInt()
  @IsOptional()
  lastMinuteRemainingNights?: number;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
