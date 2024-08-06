import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Properties } from 'src/main/entities/properties.entity';
import { User } from 'src/main/entities/user.entity';

export class CreatePropertyDetailsResponseDto {
  @IsNotEmpty()
  property: Properties;

  @IsOptional()
  noOfGuestsAllowed?: number;

  @IsOptional()
  noOfBedrooms?: number;

  @IsOptional()
  noOfBathrooms?: number;

  @IsOptional()
  squareFootage?: string;

  @IsOptional()
  checkInTime?: Date;

  @IsOptional()
  checkOutTime?: Date;

  @IsOptional()
  cleaningFee?: number;

  @IsOptional()
  noOfPetsAllowed?: number;

  @IsOptional()
  petPolicy?: string;

  @IsOptional()
  feePerPet?: number;

  @IsOptional()
  peakSeasonStartDate?: Date;

  @IsOptional()
  peakSeasonEndDate?: Date;

  @IsOptional()
  peakSeasonAllottedNights?: number;

  @IsOptional()
  offSeasonAllottedNights?: number;

  @IsOptional()
  peakSeasonAllottedHolidayNights?: number;

  @IsOptional()
  offSeasonAllottedHolidayNights?: number;

  @IsOptional()
  lastMinuteBookingAllottedNights?: number;

  @IsOptional()
  wifiNetwork?: string;

  @IsInt()
  @Min(1)
  createdBy: User;
}
