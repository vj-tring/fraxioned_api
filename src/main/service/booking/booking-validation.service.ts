import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../entities/property.entity';
import { PropertyDetails } from '../../entities/property-details.entity';
import { UserProperties } from '../../entities/user-properties.entity';
import { Booking } from '../../entities/booking.entity';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { normalizeDate } from './utils/booking.util';
import { User } from 'src/main/entities/user.entity';

@Injectable()
export class BookingValidationService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async validateBooking(
    createBookingDto: CreateBookingDTO,
  ): Promise<true | object> {
    const { checkinDate, checkoutDate, user, property, noOfGuests, noOfPets } =
      createBookingDto;

    const propertyDetails = await this.propertyDetailsRepository.findOne({
      where: { property },
    });
    if (!propertyDetails) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    const dateValidation = this.validateDates(
      checkinDate,
      checkoutDate,
      propertyDetails,
    );
    if (dateValidation !== true) {
      return dateValidation;
    }

    const guestValidation = this.validateGuests(
      noOfGuests,
      noOfPets,
      propertyDetails,
    );
    if (guestValidation !== true) {
      return guestValidation;
    }

    const bookingConflict = await this.checkBookingConflicts(
      property,
      checkinDate,
      checkoutDate,
    );
    if (bookingConflict !== true) {
      return bookingConflict;
    }

    const userPropertyValidation = await this.validateUserProperties(
      user,
      property,
      checkinDate,
      checkoutDate,
    );
    if (userPropertyValidation !== true) {
      return userPropertyValidation;
    }

    return true;
  }

  private validateDates(
    checkinDate: Date,
    checkoutDate: Date,
    propertyDetails: PropertyDetails,
  ): true | object {
    const today = new Date();
    const normalizedCheckinDate = normalizeDate(checkinDate);
    const normalizedCheckoutDate = normalizeDate(checkoutDate);

    if (normalizedCheckinDate < normalizeDate(today)) {
      return BOOKING_RESPONSES.CHECKIN_DATE_PAST;
    }

    if (normalizedCheckinDate >= normalizedCheckoutDate) {
      return BOOKING_RESPONSES.CHECKOUT_BEFORE_CHECKIN;
    }

    const checkInEndDate = new Date(today);
    checkInEndDate.setFullYear(today.getFullYear() + 2);

    if (normalizedCheckinDate > checkInEndDate) {
      return BOOKING_RESPONSES.DATES_OUT_OF_RANGE;
    }

    const checkinDateTime = new Date(normalizedCheckinDate);
    checkinDateTime.setHours(propertyDetails.checkInTime, 0, 0, 0);

    const timeDifference = checkinDateTime.getTime() - today.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return BOOKING_RESPONSES.BOOKING_TOO_CLOSE_TO_CHECKIN;
    }

    return true;
  }

  private validateGuests(
    noOfGuests: number,
    noOfPets: number,
    propertyDetails: PropertyDetails,
  ): true | object {
    if (
      noOfGuests > propertyDetails.noOfGuestsAllowed ||
      noOfPets > propertyDetails.noOfPetsAllowed
    ) {
      return BOOKING_RESPONSES.GUESTS_LIMIT_EXCEEDS;
    }
    return true;
  }

  private async checkBookingConflicts(
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<true | object> {
    const bookedDates = await this.bookingRepository.find({
      where: { property },
      select: ['checkinDate', 'checkoutDate'],
    });

    const normalizedCheckinDate = normalizeDate(checkinDate);
    const normalizedCheckoutDate = normalizeDate(checkoutDate);

    for (const bookedDate of bookedDates) {
      const bookedCheckin = normalizeDate(bookedDate.checkinDate);
      const bookedCheckout = normalizeDate(bookedDate.checkoutDate);

      if (
        (normalizedCheckinDate >= bookedCheckin &&
          normalizedCheckinDate < bookedCheckout) ||
        (normalizedCheckoutDate > bookedCheckin &&
          normalizedCheckoutDate <= bookedCheckout) ||
        (normalizedCheckinDate <= bookedCheckin &&
          normalizedCheckoutDate >= bookedCheckout)
      ) {
        return BOOKING_RESPONSES.DATES_BOOKED_OR_UNAVAILABLE;
      }
    }

    return true;
  }

  private async validateUserProperties(
    user: User,
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<true | object> {
    const checkinYear = new Date(checkinDate).getFullYear();
    const checkoutYear = new Date(checkoutDate).getFullYear();

    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: { user, property, year: checkinYear },
    });

    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: { user, property, year: checkoutYear },
    });

    if (!userPropertyFirstYear || !userPropertySecondYear) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    return true;
  }
}
