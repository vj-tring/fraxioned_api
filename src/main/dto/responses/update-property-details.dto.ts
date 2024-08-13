import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { User } from 'src/main/entities/user.entity';

export class UpdatePropertyDetailsResponseDto {
  @IsOptional()
  noOfGuestsAllowed?: number;

  @IsOptional()
  noOfBedrooms?: number;

  @IsOptional()
  noOfBathrooms?: number;

  @IsOptional()
  noOfBathroomsFull?: number;

  @IsOptional()
  noOfBathroomsHalf?: number;

  @IsOptional()
  squareFootage?: string;

  @IsOptional()
  checkInTime?: number;

  @IsOptional()
  checkOutTime?: number;

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

  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
