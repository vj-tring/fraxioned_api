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
  private readonly MS_PER_HOUR = 1000 * 60 * 60;
  private readonly MS_PER_DAY = this.MS_PER_HOUR * 24;

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
    const normalizedToday = normalizeDate(today);

    if (checkinDate < normalizedToday) {
      return BOOKING_RESPONSES.CHECKIN_DATE_PAST;
    }

    if (checkinDate >= checkoutDate) {
      return BOOKING_RESPONSES.CHECKOUT_BEFORE_CHECKIN;
    }

    const checkInEndDate = new Date(today.getFullYear() + 2, 11, 31);

    if (checkinDate > checkInEndDate) {
      return BOOKING_RESPONSES.DATES_OUT_OF_RANGE;
    }

    const checkinDateTime = new Date(checkinDate);
    checkinDateTime.setHours(propertyDetails.checkInTime, 0, 0, 0);

    const hoursDifference =
      (checkinDateTime.getTime() - today.getTime()) / this.MS_PER_HOUR;

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

    const [userPropertyFirstYear, userPropertySecondYear] = await Promise.all([
      this.getUserProperty(user.id, property.id, checkinYear),
      this.getUserProperty(user.id, property.id, checkoutYear),
    ]);

    if (!userPropertyFirstYear || !userPropertySecondYear) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    return true;
  }

  private async getUserProperty(
    userId: number,
    propertyId: number,
    year: number,
  ): Promise<UserProperties | undefined> {
    return this.userPropertiesRepository.findOne({
      where: {
        user: { id: userId },
        property: { id: propertyId },
        year,
        isActive: true,
      },
    });
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
        user: { id: user.id },
        property: { id: property.id },
        checkoutDate: MoreThanOrEqual(today),
        isCompleted: false,
        isCancelled: false,
      },
      order: { checkoutDate: 'DESC' },
    });

    for (const booking of lastBookings) {
      const lastCheckoutDate = normalizeDate(booking.checkoutDate);
      const lastCheckinDate = normalizeDate(booking.checkinDate);

      const diffInDaysFromCheckout = this.getDaysDifference(
        checkinDate,
        lastCheckoutDate,
      );
      const diffInDaysFromCheckoutToLastCheckin = this.getDaysDifference(
        checkoutDate,
        lastCheckinDate,
      );
      const diffInDaysFromCheckin = this.getDaysDifference(
        lastCheckinDate,
        checkinDate,
      );

      if (
        this.isInsufficientGap(
          diffInDaysFromCheckout,
          diffInDaysFromCheckoutToLastCheckin,
          diffInDaysFromCheckin,
        )
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_GAP_BETWEEN_BOOKINGS;
      }
    }

    return true;
  }

  private getDaysDifference(date1: Date, date2: Date): number {
    return (date1.getTime() - date2.getTime()) / this.MS_PER_DAY;
  }

  private isInsufficientGap(
    diffFromCheckout: number,
    diffFromCheckoutToLastCheckin: number,
    diffFromCheckin: number,
  ): boolean {
    return (
      (diffFromCheckout >= 0 && diffFromCheckout <= 5) ||
      (diffFromCheckoutToLastCheckin >= -5 &&
        diffFromCheckoutToLastCheckin < 0) ||
      (diffFromCheckin >= 0 && diffFromCheckin <= 5)
    );
  }

  async validateBookedDates(
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<true | object> {
    const bookedDates = await this.bookingRepository.find({
      where: { property },
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
    checkoutDate: Date,
  ): Promise<true | object> {
    const [userPropertyFirstYear, userPropertySecondYear] = await Promise.all([
      this.getUserProperty(user.id, property.id, checkinDate.getFullYear()),
      this.getUserProperty(user.id, property.id, checkoutDate.getFullYear()),
    ]);

    if (!userPropertyFirstYear || !userPropertySecondYear) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    if (isLastMinuteBooking) {
      return this.validateLastMinuteBooking(
        nightsSelected,
        nightCounts,
        userPropertyFirstYear,
        userPropertySecondYear,
      );
    } else {
      return this.validateRegularBooking(
        nightsSelected,
        nightCounts,
        user,
        property,
        checkinDate,
        userPropertyFirstYear,
        userPropertySecondYear,
      );
    }
  }

  private validateLastMinuteBooking(
    nightsSelected: number,
    nightCounts: NightCounts,
    userPropertyFirstYear: UserProperties,
    userPropertySecondYear: UserProperties,
  ): true | object {
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

    return true;
  }

  private async validateRegularBooking(
    nightsSelected: number,
    nightCounts: NightCounts,
    user: User,
    property: Property,
    checkinDate: Date,
    userPropertyFirstYear: UserProperties,
    userPropertySecondYear: UserProperties,
  ): Promise<true | object> {
    if (nightsSelected < BookingRules.REGULAR_MIN_NIGHTS) {
      return BOOKING_RESPONSES.REGULAR_MIN_NIGHTS(
        BookingRules.REGULAR_MIN_NIGHTS,
      );
    }

    const totalNights = this.getTotalNights(nightCounts);
    if (totalNights > userPropertyFirstYear.maximumStayLength) {
      return BOOKING_RESPONSES.MAX_STAY_LENGTH_EXCEEDED;
    }

    if (
      this.isInsufficientPeakNights(
        nightCounts,
        userPropertyFirstYear,
        userPropertySecondYear,
      )
    ) {
      return BOOKING_RESPONSES.INSUFFICIENT_PEAK_NIGHTS;
    }

    if (
      this.isInsufficientOffNights(
        nightCounts,
        userPropertyFirstYear,
        userPropertySecondYear,
      )
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
      this.isInsufficientOffHolidayNights(
        nightCounts,
        userPropertyFirstYear,
        userPropertySecondYear,
      )
    ) {
      return BOOKING_RESPONSES.INSUFFICIENT_OFF_HOLIDAY_NIGHTS;
    }

    return true;
  }

  private getTotalNights(nightCounts: NightCounts): number {
    return (
      nightCounts.peakNightsInFirstYear +
      nightCounts.offNightsInFirstYear +
      nightCounts.peakNightsInSecondYear +
      nightCounts.offNightsInSecondYear
    );
  }

  private isInsufficientPeakNights(
    nightCounts: NightCounts,
    userPropertyFirstYear: UserProperties,
    userPropertySecondYear: UserProperties,
  ): boolean {
    return (
      nightCounts.peakNightsInFirstYear >
        userPropertyFirstYear.peakRemainingNights ||
      nightCounts.peakNightsInSecondYear >
        userPropertySecondYear.peakRemainingNights
    );
  }

  private isInsufficientOffNights(
    nightCounts: NightCounts,
    userPropertyFirstYear: UserProperties,
    userPropertySecondYear: UserProperties,
  ): boolean {
    return (
      nightCounts.offNightsInFirstYear >
        userPropertyFirstYear.offRemainingNights ||
      nightCounts.offNightsInSecondYear >
        userPropertySecondYear.offRemainingNights
    );
  }

  private isInsufficientOffHolidayNights(
    nightCounts: NightCounts,
    userPropertyFirstYear: UserProperties,
    userPropertySecondYear: UserProperties,
  ): boolean {
    return (
      nightCounts.offHolidayNightsInFirstYear >
        userPropertyFirstYear.offRemainingHolidayNights ||
      nightCounts.offHolidayNightsInSecondYear >
        userPropertySecondYear.offRemainingHolidayNights
    );
  }

  async validatePeakSeasonHolidays(
    user: User,
    property: Property,
    checkinDate: Date,
    peakHolidayNightsInFirstYear: number,
    peakHolidayNightsInSecondYear: number,
  ): Promise<boolean> {
    const firstYear = checkinDate.getFullYear();
    const userPropertyFirstYear = await this.getUserProperty(
      user.id,
      property.id,
      firstYear,
    );

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
