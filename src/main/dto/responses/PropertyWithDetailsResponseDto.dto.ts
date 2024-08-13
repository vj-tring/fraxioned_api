import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/main/entities/user.entity';

export class PropertyWithDetailsResponseDto {
  @ApiProperty({ example: 1 })
  propertyId: number;

  @ApiProperty({ example: 1 })
  propertyDetailsId: number;

  @ApiProperty({ example: '2024-08-12T16:00:50.953Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-08-12T16:01:14.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: () => User })
  createdBy: User;

  @ApiProperty({ type: () => User })
  updatedBy: User;

  @ApiProperty({ example: '2024-03-14T18:30:00.000Z' })
  peakSeasonStartDate: Date;

  @ApiProperty({ example: '2024-06-27T18:30:00.000Z' })
  peakSeasonEndDate: Date;

  @ApiProperty({ example: 24 })
  noOfGuestsAllowed: number;

  @ApiProperty({ example: 8 })
  noOfBedrooms: number;

  @ApiProperty({ example: 9 })
  noOfBathrooms: number;

  @ApiProperty({ example: 9 })
  noOfBathroomsFull: number;

  @ApiProperty({ example: 0 })
  noOfBathroomsHalf: number;

  @ApiProperty({ example: 2 })
  noOfPetsAllowed: number;

  @ApiProperty({ example: '5300' })
  squareFootage: string;

  @ApiProperty({ example: 4 })
  checkInTime: number;

  @ApiProperty({ example: 11 })
  checkOutTime: number;

  @ApiProperty({ example: 'Pets Allowed' })
  petPolicy: string;

  @ApiProperty({ example: 0 })
  feePerPet: number;

  @ApiProperty({ example: 600 })
  cleaningFee: number;

  @ApiProperty({ example: 0 })
  peakSeasonAllottedNights: number;

  @ApiProperty({ example: 0 })
  offSeasonAllottedNights: number;

  @ApiProperty({ example: 0 })
  peakSeasonAllottedHolidayNights: number;

  @ApiProperty({ example: 0 })
  offSeasonAllottedHolidayNights: number;

  @ApiProperty({ example: 0 })
  lastMinuteBookingAllottedNights: number;

  @ApiProperty({ example: 'QuantumFiber8362' })
  wifiNetwork: string;
}
