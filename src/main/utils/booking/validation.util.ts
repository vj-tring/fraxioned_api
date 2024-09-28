import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { UserProperties } from 'entities/user-properties.entity';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { BookingRules } from 'src/main/commons/constants/enumerations/booking-rules';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { normalizeDate } from './date.util';
import { NightCounts } from 'src/main/commons/interface/booking/night-counts.interface';

@Injectable()
export class BookingValidationService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
  ) {}

  validateDates(
    checkinDate: Date,
    checkoutDate: Date,
    propertyDetails: PropertyDetails,
  ): true | object {
    const today = new Date();

    if (checkinDate < normalizeDate(today)) {
      return BOOKING_RESPONSES.CHECKIN_DATE_PAST;
    }

    if (checkinDate >= checkoutDate) {
      return BOOKING_RESPONSES.CHECKOUT_BEFORE_CHECKIN;
    }

    const checkInEndDate = new Date(today);
    checkInEndDate.setFullYear(today.getFullYear() + 2);

    if (checkinDate > checkInEndDate) {
      return BOOKING_RESPONSES.DATES_OUT_OF_RANGE;
    }

    const checkinDateTime = new Date(checkinDate);
    checkinDateTime.setHours(propertyDetails.checkInTime, 0, 0, 0);

    const timeDifference = checkinDateTime.getTime() - today.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return BOOKING_RESPONSES.BOOKING_TOO_CLOSE_TO_CHECKIN;
    }

    return true;
  }

  async validateUserProperty(
    user: User,
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<true | object> {
    const checkinYear = checkinDate.getFullYear();
    const checkoutYear = checkoutDate.getFullYear();

    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: checkinYear,
      },
    });
    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: checkoutYear,
      },
    });

    if (!userPropertyFirstYear || !userPropertySecondYear) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    return true;
  }

  validateGuestLimits(
    createBookingDto: CreateBookingDTO,
    propertyDetails: PropertyDetails,
  ): true | object {
    if (
      createBookingDto.noOfGuests > propertyDetails.noOfGuestsAllowed ||
      createBookingDto.noOfPets > propertyDetails.noOfPetsAllowed
    ) {
      return BOOKING_RESPONSES.GUESTS_LIMIT_EXCEEDS;
    }

    return true;
  }

  async validateBookingGap(
    user: User,
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<true | object> {
    const today = new Date();
    const lastBookings = await this.bookingRepository.find({
      where: {
        user: user,
        property: property,
        checkoutDate: MoreThanOrEqual(today),
        isCompleted: false,
        isCancelled: false,
      },
      order: { checkoutDate: 'DESC' },
    });

    for (const booking of lastBookings) {
      const lastCheckoutDate = normalizeDate(new Date(booking.checkoutDate));
      const lastCheckinDate = normalizeDate(new Date(booking.checkinDate));
      const diffInDaysFromCheckout =
        (checkinDate.getTime() - lastCheckoutDate.getTime()) /
        (1000 * 60 * 60 * 24);
      const diffInDaysFromCheckoutToLastCheckin =
        (checkoutDate.getTime() - lastCheckinDate.getTime()) /
        (1000 * 60 * 60 * 24);
      const diffInDaysFromCheckin =
        (lastCheckinDate.getTime() - checkinDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diffInDaysFromCheckout >= 0 && diffInDaysFromCheckout <= 5) {
        return BOOKING_RESPONSES.INSUFFICIENT_GAP_BETWEEN_BOOKINGS;
      }
      if (
        diffInDaysFromCheckoutToLastCheckin >= -5 &&
        diffInDaysFromCheckoutToLastCheckin < 0
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_GAP_BETWEEN_BOOKINGS;
      }
      if (diffInDaysFromCheckin >= 0 && diffInDaysFromCheckin <= 5) {
        return BOOKING_RESPONSES.INSUFFICIENT_GAP_BETWEEN_BOOKINGS;
      }
    }

    return true;
  }

  async validateBookedDates(
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<true | object> {
    const bookedDates = await this.bookingRepository.find({
      where: { property: property },
      select: ['checkinDate', 'checkoutDate', 'isCompleted', 'isCancelled'],
    });

    const isBookedDate = (date: Date): boolean =>
      bookedDates.some(
        (booking) =>
          date >= normalizeDate(booking.checkinDate) &&
          date < normalizeDate(booking.checkoutDate) &&
          !booking.isCompleted &&
          !booking.isCancelled,
      );

    for (
      let date = new Date(checkinDate);
      date < checkoutDate;
      date.setDate(date.getDate() + 1)
    ) {
      if (isBookedDate(date)) {
        return BOOKING_RESPONSES.DATES_BOOKED_OR_UNAVAILABLE;
      }
    }

    return true;
  }

  async validateBookingRules(
    isLastMinuteBooking: boolean,
    nightsSelected: number,
    nightCounts: NightCounts,
    user: User,
    property: Property,
    checkinDate: Date,
  ): Promise<true | object> {
    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: checkinDate.getFullYear(),
      },
    });
    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: checkinDate.getFullYear() + 1,
      },
    });

    if (isLastMinuteBooking) {
      if (nightsSelected < BookingRules.LAST_MIN_NIGHTS) {
        return BOOKING_RESPONSES.LAST_MINUTE_MIN_NIGHTS(
          BookingRules.LAST_MIN_NIGHTS,
        );
      }
      if (nightsSelected > BookingRules.LAST_MAX_NIGHTS) {
        return BOOKING_RESPONSES.LAST_MINUTE_MAX_NIGHTS(
          BookingRules.LAST_MAX_NIGHTS,
        );
      }
      const nightsFirstYear =
        nightCounts.peakNightsInFirstYear + nightCounts.offNightsInFirstYear;
      const nightsSecondYear =
        nightCounts.peakNightsInSecondYear + nightCounts.offNightsInSecondYear;
      if (
        nightsFirstYear > userPropertyFirstYear.lastMinuteRemainingNights ||
        nightsSecondYear > userPropertySecondYear.lastMinuteRemainingNights
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_LAST_MIN_BOOKING_NIGHTS;
      }
    } else {
      if (nightsSelected < BookingRules.REGULAR_MIN_NIGHTS) {
        return BOOKING_RESPONSES.REGULAR_MIN_NIGHTS(
          BookingRules.REGULAR_MIN_NIGHTS,
        );
      }
      const nightsFirstYear =
        nightCounts.peakNightsInFirstYear + nightCounts.offNightsInFirstYear;
      const nightsSecondYear =
        nightCounts.peakNightsInSecondYear + nightCounts.offNightsInSecondYear;
      if (
        nightsFirstYear + nightsSecondYear >
        userPropertyFirstYear.maximumStayLength
      ) {
        return BOOKING_RESPONSES.MAX_STAY_LENGTH_EXCEEDED;
      }
      if (
        nightCounts.peakNightsInFirstYear >
          userPropertyFirstYear.peakRemainingNights ||
        nightCounts.peakNightsInSecondYear >
          userPropertySecondYear.peakRemainingNights
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_PEAK_NIGHTS;
      }
      if (
        nightCounts.offNightsInFirstYear >
          userPropertyFirstYear.offRemainingNights ||
        nightCounts.offNightsInSecondYear >
          userPropertySecondYear.offRemainingNights
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_OFF_NIGHTS;
      }
      const isValidCrossYearHoliday = await this.validatePeakSeasonHolidays(
        user,
        property,
        checkinDate,
        nightCounts.peakHolidayNightsInFirstYear,
        nightCounts.peakHolidayNightsInSecondYear,
      );
      if (!isValidCrossYearHoliday) {
        return BOOKING_RESPONSES.INSUFFICIENT_PEAK_HOLIDAY_NIGHTS;
      }
      if (
        nightCounts.offHolidayNightsInFirstYear >
          userPropertyFirstYear.offRemainingHolidayNights ||
        nightCounts.offHolidayNightsInSecondYear >
          userPropertySecondYear.offRemainingHolidayNights
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_OFF_HOLIDAY_NIGHTS;
      }
    }

    return true;
  }

  async validatePeakSeasonHolidays(
    user: User,
    property: Property,
    checkinDate: Date,
    peakHolidayNightsInFirstYear: number,
    peakHolidayNightsInSecondYear: number,
  ): Promise<boolean> {
    const firstYear = checkinDate.getFullYear();

    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: firstYear,
      },
    });

    if (!userPropertyFirstYear) {
      return false;
    }

    const remainingNights = userPropertyFirstYear.peakRemainingHolidayNights;

    return (
      peakHolidayNightsInFirstYear + peakHolidayNightsInSecondYear <=
      remainingNights
    );
  }
}
