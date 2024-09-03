import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { CreateBookingDTO } from '../../dto/requests/booking/create-booking.dto';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertySeasonHolidays } from 'entities/property-season-holidays.entity';
import { PropertyDetails } from '../../entities/property-details.entity';
import { BookingRules } from '../../commons/constants/enumerations/booking-rules';

@Injectable()
export class CreateBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(PropertySeasonHolidays)
    private readonly propertySeasonHolidaysRepository: Repository<PropertySeasonHolidays>,
    private readonly logger: LoggerService,
  ) {}

  private normalizeDate(date: Date | string): Date {
    const parsedDate = new Date(date);
    return new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
    );
  }

  private extractMonthDay(date: Date): { month: number; day: number } {
    return { month: date.getMonth(), day: date.getDate() };
  }

  private isDateInRange(date: Date, start: Date, end: Date): boolean {
    const { month: dateMonth, day: dateDay } = this.extractMonthDay(date);
    const { month: startMonth, day: startDay } = this.extractMonthDay(start);
    const { month: endMonth, day: endDay } = this.extractMonthDay(end);

    if (
      startMonth < endMonth ||
      (startMonth === endMonth && startDay <= endDay)
    ) {
      return (
        (dateMonth > startMonth ||
          (dateMonth === startMonth && dateDay >= startDay)) &&
        (dateMonth < endMonth || (dateMonth === endMonth && dateDay <= endDay))
      );
    } else {
      return (
        dateMonth > startMonth ||
        (dateMonth === startMonth && dateDay >= startDay) ||
        dateMonth < endMonth ||
        (dateMonth === endMonth && dateDay <= endDay)
      );
    }
  }

  async createBooking(createBookingDto: CreateBookingDTO): Promise<object> {
    this.logger.log('Creating a new booking');

    const {
      checkinDate: checkinDateStr,
      checkoutDate: checkoutDateStr,
      property,
      user,
    } = createBookingDto;

    const today = new Date();
    const checkinDate = this.normalizeDate(checkinDateStr);
    const checkoutDate = this.normalizeDate(checkoutDateStr);

    if (checkinDate < today) {
      return BOOKING_RESPONSES.CHECKIN_DATE_PAST;
    }

    if (checkinDate >= checkoutDate) {
      return BOOKING_RESPONSES.CHECKOUT_BEFORE_CHECKIN;
    }

    const checkInEndDate = this.normalizeDate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 730),
    );
    const checkOutEndDate = this.normalizeDate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 730),
    );

    const isLeapYear = (year: number): boolean => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    const daysInYear = isLeapYear(today.getFullYear()) ? 366 : 365;
    const daysInNextYear = isLeapYear(today.getFullYear() + 1) ? 366 : 365;

    if (daysInYear === 366 || daysInNextYear === 366) {
      checkOutEndDate.setDate(checkOutEndDate.getDate() + 1);
    }

    if (checkinDate > checkInEndDate || checkoutDate > checkOutEndDate) {
      return BOOKING_RESPONSES.DATES_OUT_OF_RANGE;
    }

    const propertyDetails = await this.propertyDetailsRepository.findOne({
      where: { property: property },
    });

    if (!propertyDetails) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    const checkinTime = new Date(checkinDate);
    checkinTime.setHours(propertyDetails.checkInTime, 0, 0, 0);

    const timeDifference = checkinTime.getTime() - today.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return BOOKING_RESPONSES.BOOKING_TOO_CLOSE_TO_CHECKIN;
    }

    // Fetch user properties based on the year of booking
    const bookingYear = checkinDate.getFullYear();
    if (isNaN(bookingYear)) {
      this.logger.error('Invalid booking year');
      return BOOKING_RESPONSES.INVALID_BOOKING_YEAR;
    }

    const userProperty = await this.userPropertiesRepository.findOne({
      where: { user: user, property: property, year: bookingYear },
    });

    if (!userProperty) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    if (
      createBookingDto.noOfGuests > propertyDetails.noOfGuestsAllowed ||
      createBookingDto.noOfPets > propertyDetails.noOfPetsAllowed
    ) {
      return BOOKING_RESPONSES.GUESTS_LIMIT_EXCEEDS;
    }

    // Fetch booked and unavailable dates from the database
    const bookedDates = await this.bookingRepository.find({
      where: { property: property },
      select: ['checkinDate', 'checkoutDate'],
    });

    const unavailableDates = await this.propertySeasonHolidaysRepository.find({
      where: { property: property },
      select: ['holiday'],
    });

    const isBookedDate = (date: Date): boolean =>
      bookedDates.some(
        (booking) =>
          date >= this.normalizeDate(booking.checkinDate) &&
          date <= this.normalizeDate(booking.checkoutDate),
      );

    const isUnavailableDate = (date: Date): boolean =>
      unavailableDates.some(
        (unavailable) =>
          this.normalizeDate(
            new Date(unavailable.holiday as unknown as string),
          ).getTime() === date.getTime(),
      );

    const peakSeasonStart = this.normalizeDate(
      new Date(propertyDetails.peakSeasonStartDate),
    );
    const peakSeasonEnd = this.normalizeDate(
      new Date(propertyDetails.peakSeasonEndDate),
    );

    // Validation: Check if any date in the range is booked or unavailable
    let remainingPeakHolidayNights = userProperty.peakRemainingHolidayNights;
    let remainingOffHolidayNights = userProperty.offRemainingHolidayNights;

    for (
      let d = new Date(checkinDate);
      d <= checkoutDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (isBookedDate(d)) {
        return BOOKING_RESPONSES.DATES_BOOKED_OR_UNAVAILABLE;
      }

      if (isUnavailableDate(d)) {
        if (this.isDateInRange(d, peakSeasonStart, peakSeasonEnd)) {
          if (remainingPeakHolidayNights > 0) {
            remainingPeakHolidayNights--;
          } else {
            return BOOKING_RESPONSES.INSUFFICIENT_PEAK_HOLIDAY_NIGHTS;
          }
        } else {
          if (remainingOffHolidayNights > 0) {
            remainingOffHolidayNights--;
          } else {
            return BOOKING_RESPONSES.INSUFFICIENT_OFF_HOLIDAY_NIGHTS;
          }
        }
      }
    }

    // Validation: Check last-minute booking rules
    const diffInDays =
      (checkinDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    const isLastMinuteBooking = diffInDays <= BookingRules.LAST_MAX_DAYS;
    const nightsSelected =
      (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24);

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
    } else {
      if (nightsSelected < BookingRules.REGULAR_MIN_NIGHTS) {
        return BOOKING_RESPONSES.REGULAR_MIN_NIGHTS(
          BookingRules.REGULAR_MIN_NIGHTS,
        );
      }
      if (nightsSelected > userProperty.maximumStayLength) {
        return BOOKING_RESPONSES.MAX_STAY_LENGTH_EXCEEDED;
      }
    }

    const lastBooking = await this.bookingRepository.findOne({
      where: { user: user, property: property },
      order: { checkoutDate: 'DESC' },
    });

    if (lastBooking) {
      const lastCheckoutDate = this.normalizeDate(
        new Date(lastBooking.checkoutDate),
      );
      const diffInDays =
        (checkinDate.getTime() - lastCheckoutDate.getTime()) /
        (1000 * 60 * 60 * 24);
      if (diffInDays < 5) {
        return BOOKING_RESPONSES.INSUFFICIENT_GAP_BETWEEN_BOOKINGS;
      }
    }

    let peakNights = 0;
    let offNights = 0;
    let peakHolidayNights = 0;
    let offHolidayNights = 0;

    for (
      let d = new Date(checkinDate);
      d < checkoutDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (isUnavailableDate(d)) {
        if (this.isDateInRange(d, peakSeasonStart, peakSeasonEnd)) {
          peakHolidayNights++;
        } else {
          offHolidayNights++;
        }
      } else if (this.isDateInRange(d, peakSeasonStart, peakSeasonEnd)) {
        peakNights++;
      } else {
        offNights++;
      }
    }

    if (peakNights > userProperty.peakRemainingNights) {
      return BOOKING_RESPONSES.INSUFFICIENT_PEAK_NIGHTS;
    }

    if (offNights > userProperty.offRemainingNights) {
      return BOOKING_RESPONSES.INSUFFICIENT_OFF_NIGHTS;
    }

    if (peakHolidayNights > userProperty.peakRemainingHolidayNights) {
      return BOOKING_RESPONSES.INSUFFICIENT_PEAK_HOLIDAY_NIGHTS;
    }

    if (offHolidayNights > userProperty.offRemainingHolidayNights) {
      return BOOKING_RESPONSES.INSUFFICIENT_OFF_HOLIDAY_NIGHTS;
    }

    const booking = this.bookingRepository.create(createBookingDto);
    await this.bookingRepository.save(booking);

    // Update user properties after successful booking
    userProperty.peakRemainingNights -= peakNights;
    userProperty.offRemainingNights -= offNights;
    userProperty.peakRemainingHolidayNights -= peakHolidayNights;
    userProperty.offRemainingHolidayNights -= offHolidayNights;

    userProperty.peakBookedNights += peakNights;
    userProperty.offBookedNights += offNights;
    userProperty.peakBookedHolidayNights += peakHolidayNights;
    userProperty.offBookedHolidayNights += offHolidayNights;

    if (isLastMinuteBooking) {
      userProperty.lastMinuteRemainingNights -= nightsSelected;
    }

    await this.userPropertiesRepository.save(userProperty);

    return BOOKING_RESPONSES.BOOKING_CREATED(booking);
  }
}
