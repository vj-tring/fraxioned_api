import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export interface PropertyDetailsInterface {
  id: number;
  property: Property;
  noOfGuestsAllowed: number;
  noOfBedrooms: number;
  noOfBathrooms: number;
  noOfBathroomsFull: number;
  noOfBathroomsHalf: number;
  noOfPetsAllowed: number;
  squareFootage: string;
  checkInTime: number;
  checkOutTime: number;
  petPolicy: string;
  feePerPet: number;
  cleaningFee: number;
  peakSeasonStartDate: Date;
  peakSeasonEndDate: Date;
  peakSeasonAllottedNights: number;
  offSeasonAllottedNights: number;
  peakSeasonAllottedHolidayNights: number;
  offSeasonAllottedHolidayNights: number;
  lastMinuteBookingAllottedNights: number;
  wifiNetwork: string;
  createdBy: User;
  updatedBy: User;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProperty {
  id: number;
  user: User;
  property: Property;
  noOfShare: number;
  acquisitionDate: Date;
  isActive: boolean;
  year: number;
  peakAllottedNights: number;
  peakUsedNights: number;
  peakBookedNights: number;
  peakCancelledNights: number;
  peakLostNights: number;
  peakRemainingNights: number;
  peakAllottedHolidayNights: number;
  peakUsedHolidayNights: number;
  peakBookedHolidayNights: number;
  peakRemainingHolidayNights: number;
  peakCancelledHolidayNights: number;
  peakLostHolidayNights: number;
  offAllottedNights: number;
  offUsedNights: number;
  offBookedNights: number;
  offCancelledNights: number;
  offLostNights: number;
  offRemainingNights: number;
  offAllottedHolidayNights: number;
  offUsedHolidayNights: number;
  offBookedHolidayNights: number;
  offRemainingHolidayNights: number;
  offCancelledHolidayNights: number;
  offLostHolidayNights: number;
  lastMinuteAllottedNights: number;
  lastMinuteUsedNights: number;
  lastMinuteBookedNights: number;
  lastMinuteRemainingNights: number;
  createdBy: User;
  updatedBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyWithDetails {
  propertyId: number;
  propertyDetailsId: number | null;
  ownerRezPropId: number;
  propertyName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: number;
  houseDescription: string;
  isExclusive: boolean;
  propertyShare: number;
  latitude: number;
  longitude: number;
  isActive: boolean;
  displayOrder: number | null;
  createdBy: User;
  updatedBy: User;
  createdAt: Date;
  updatedAt: Date;
  userProperties: Omit<UserProperty, 'property'>[];
}
