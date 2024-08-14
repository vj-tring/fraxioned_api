import { ApiProperty } from '@nestjs/swagger';

export class UserPropertyDetailsDTO {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  noOfShare: number;

  @ApiProperty({ example: '2024-08-13T16:23:45.000Z' })
  acquisitionDate: Date;

  @ApiProperty({ example: 1 })
  isActive: number;

  @ApiProperty({ example: 2021 })
  year: number;

  @ApiProperty({ example: 0 })
  peakAllottedNights: number;

  @ApiProperty({ example: 0 })
  peakUsedNights: number;

  @ApiProperty({ example: 0 })
  peakBookedNights: number;

  @ApiProperty({ example: 0 })
  peakCancelledNights: number;

  @ApiProperty({ example: 0 })
  peakLostNights: number;

  @ApiProperty({ example: 0 })
  peakRemainingNights: number;

  @ApiProperty({ example: 0 })
  peakAllottedHolidayNights: number;

  @ApiProperty({ example: 0 })
  peakUsedHolidayNights: number;

  @ApiProperty({ example: 0 })
  peakBookedHolidayNights: number;

  @ApiProperty({ example: 0 })
  peakRemainingHolidayNights: number;

  @ApiProperty({ example: 0 })
  peakCancelledHolidayNights: number;

  @ApiProperty({ example: 0 })
  peakLostHolidayNights: number;

  @ApiProperty({ example: 0 })
  offAllottedNights: number;

  @ApiProperty({ example: 0 })
  offUsedNights: number;

  @ApiProperty({ example: 0 })
  offBookedNights: number;

  @ApiProperty({ example: 0 })
  offCancelledNights: number;

  @ApiProperty({ example: 0 })
  offLostNights: number;

  @ApiProperty({ example: 0 })
  offRemainingNights: number;

  @ApiProperty({ example: 0 })
  offAllottedHolidayNights: number;

  @ApiProperty({ example: 0 })
  offUsedHolidayNights: number;

  @ApiProperty({ example: 0 })
  offBookedHolidayNights: number;

  @ApiProperty({ example: 0 })
  offRemainingHolidayNights: number;

  @ApiProperty({ example: 0 })
  offCancelledHolidayNights: number;

  @ApiProperty({ example: 0 })
  offLostHolidayNights: number;

  @ApiProperty({ example: 0 })
  lastMinuteAllottedNights: number;

  @ApiProperty({ example: 0 })
  lastMinuteUsedNights: number;

  @ApiProperty({ example: 0 })
  lastMinuteBookedNights: number;

  @ApiProperty({ example: 0 })
  lastMinuteRemainingNights: number;

  @ApiProperty({ example: '2024-08-14T08:06:22.358Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-08-14T08:06:22.358Z' })
  updatedAt: Date;
}

export class UserPropertyWithDetailsResponseDto {
  @ApiProperty({ example: 1 })
  propertyId: number;

  @ApiProperty({ example: 1 })
  propertyDetailsId: number | null;

  @ApiProperty({ example: '2024-08-14T08:05:05.798Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-08-14T08:05:05.798Z' })
  updatedAt: Date;

  @ApiProperty({ example: 431184 })
  ownerRezPropId: number;

  @ApiProperty({ example: 'Paradise Shores (tenths)' })
  propertyName: string;

  @ApiProperty({ example: '5367 S. Cyan Lane' })
  address: string;

  @ApiProperty({ example: 'St. George' })
  city: string;

  @ApiProperty({ example: 'Utah' })
  state: string;

  @ApiProperty({ example: 'United States' })
  country: string;

  @ApiProperty({ example: 84790 })
  zipcode: number;

  @ApiProperty({
    example:
      'Ready for an escape to your home away from home? Book a stay at the beautiful Paradise Shores, your oasis in St. George, Utah. Jump back into the clear waters of the community lagoon, just steps away from your front door. Or, if you’re looking for more privacy, take a dip in your secluded private pool and spa. With game tables, a theater room, large common areas, and cozy bedrooms, you might not want to leave the house at all. There’s room for the whole crew, so bring them all (or don’t). Either way, get ready to make some lifelong memories at your vacation home. Paradise Shores- your favorite place with your favorite people.',
  })
  houseDescription: string;

  @ApiProperty({ example: false })
  isExclusive: boolean;

  @ApiProperty({ example: 10 })
  propertyShare: number;

  @ApiProperty({ example: 0 })
  latitude: number;

  @ApiProperty({ example: 0 })
  longitude: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 2 })
  displayOrder: number;

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

  @ApiProperty({ example: 16 })
  checkInTime: number;

  @ApiProperty({ example: 11 })
  checkOutTime: number;

  @ApiProperty({ example: 'Pets Allowed' })
  petPolicy: string;

  @ApiProperty({ example: 0 })
  feePerPet: number;

  @ApiProperty({ example: 600 })
  cleaningFee: number;

  @ApiProperty({ example: '2024-03-15' })
  peakSeasonStartDate: Date;

  @ApiProperty({ example: '2024-06-28' })
  peakSeasonEndDate: Date;

  @ApiProperty({ example: 10 })
  peakSeasonAllottedNights: number;

  @ApiProperty({ example: 27 })
  offSeasonAllottedNights: number;

  @ApiProperty({ example: 1 })
  peakSeasonAllottedHolidayNights: number;

  @ApiProperty({ example: 1 })
  offSeasonAllottedHolidayNights: number;

  @ApiProperty({ example: 8 })
  lastMinuteBookingAllottedNights: number;

  @ApiProperty({ example: 'QuantumFiber8362' })
  wifiNetwork: string;

  @ApiProperty({ type: [UserPropertyDetailsDTO] })
  userProperties: UserPropertyDetailsDTO[];
}
