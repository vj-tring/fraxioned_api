import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { CreateBookingDTO } from '../dto/requests/booking/create-booking.dto';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertySeasonHolidays } from 'entities/property-season-holidays.entity';
import { PropertyDetails } from '../entities/property-details.entity';
import {
  LastMinuteBookingRules,
  RegularBookingRules,
} from '../commons/constants/enumerations/booking-rules';

@Injectable()
export class BookingService {
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
  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  async createBooking(createBookingDto: CreateBookingDTO): Promise<object> {
    this.logger.log('Creating a new booking');

    const {
      checkinDate: checkinDateStr,
      checkoutDate: checkoutDateStr,
      property,
      user,
    } = createBookingDto;
    const today = this.normalizeDate(new Date());

    // Convert checkinDate and checkoutDate to Date objects and normalize them
    const checkinDate = this.normalizeDate(new Date(checkinDateStr));
    const checkoutDate = this.normalizeDate(new Date(checkoutDateStr));

    // Validation: Check if the check-in date is before today
    if (checkinDate < today) {
      return BOOKING_RESPONSES.CHECKIN_DATE_PAST;
    }

    // Validation: Check if the check-out date is before the check-in date
    if (checkoutDate <= checkinDate) {
      return BOOKING_RESPONSES.CHECKOUT_BEFORE_CHECKIN;
    }

    // Validation: Check if the dates are within the allowed range
    const checkInEndDate = this.normalizeDate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 730),
    );
    const checkOutEndDate = this.normalizeDate(
      new Date(today.getFullYear() + 5, 11, 31),
    );

    if (checkinDate > checkInEndDate || checkoutDate > checkOutEndDate) {
      return BOOKING_RESPONSES.DATES_OUT_OF_RANGE;
    }

    // Fetch user properties
    const userProperty = await this.userPropertiesRepository.findOne({
      where: { user: user, property: property },
    });

    if (!userProperty) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    // Fetch booked and unavailable dates from the database
    const bookedDates = await this.bookingRepository.find({
      where: { property: property },
      select: ['checkinDate', 'checkoutDate'],
    });

    const propertyDetails = await this.propertyDetailsRepository.findOne({
      where: { property: property },
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
          this.normalizeDate(new Date(unavailable.holiday as unknown as string)).getTime() ===
          date.getTime(),
      );

    // Validation: Check if any date in the range is booked or unavailable
    let remainingHolidayNights = userProperty.peakRemainingHolidayNights;
    for (
      let d = new Date(checkinDate);
      d <= checkoutDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (isBookedDate(d)) {
        return BOOKING_RESPONSES.DATES_BOOKED_OR_UNAVAILABLE;
      }
      if (isUnavailableDate(d)) {
        if (remainingHolidayNights > 0) {
          remainingHolidayNights--;
        } else {
          return BOOKING_RESPONSES.DATES_BOOKED_OR_UNAVAILABLE;
        }
      }
    }

    // Validation: Check last-minute booking rules
    const diffInDays =
      (checkinDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    const isLastMinuteBooking = diffInDays <= LastMinuteBookingRules.MAX_DAYS;
    const nightsSelected =
      (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24);

    if (isLastMinuteBooking) {
      if (nightsSelected < LastMinuteBookingRules.MIN_NIGHTS) {
        return BOOKING_RESPONSES.LAST_MINUTE_MIN_NIGHTS(
          LastMinuteBookingRules.MIN_NIGHTS,
        );
      }
      if (nightsSelected > LastMinuteBookingRules.MAX_NIGHTS) {
        return BOOKING_RESPONSES.LAST_MINUTE_MAX_NIGHTS(
          LastMinuteBookingRules.MAX_NIGHTS,
        );
      }
    } else {
      if (nightsSelected < RegularBookingRules.MIN_NIGHTS) {
        return BOOKING_RESPONSES.REGULAR_MIN_NIGHTS(
          RegularBookingRules.MIN_NIGHTS,
        );
      }
      if (nightsSelected > userProperty.maximumStayLength) {
        return BOOKING_RESPONSES.MAX_STAY_LENGTH_EXCEEDED;
      }
    }

    // Additional validations from the calendar component
    const peakSeasonStart = this.normalizeDate(new Date(propertyDetails.peakSeasonStartDate));
    const peakSeasonEnd = this.normalizeDate(new Date(propertyDetails.peakSeasonEndDate));
    let peakNights = 0;
    let offNights = 0;
    for (
      let d = new Date(checkinDate);
      d < checkoutDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (d >= peakSeasonStart && d <= peakSeasonEnd) {
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

    const booking = this.bookingRepository.create(createBookingDto);
    await this.bookingRepository.save(booking);
    return BOOKING_RESPONSES.BOOKING_CREATED(booking);
  }

  async getAllBookings(): Promise<object[]> {
    try {
      const existingProperties = await this.bookingRepository.find({
        relations: ['user', 'property', 'createdBy', 'updatedBy'],
        select: {
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
          user: {
            id: true,
          },
          property: {
            id: true,
          },
        },
      });
      if (existingProperties.length === 0) {
        throw new NotFoundException(`Properties not found`);
      }
      return existingProperties;
    } catch (error) {
      throw error;
    }
  }

  async getBookingById(id: number): Promise<object> {
    this.logger.log(`Fetching booking with ID ${id}`);
    const booking = await this.bookingRepository.findOne({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      where: { id },
    });
    if (!booking) {
      this.logger.warn(`Booking with ID ${id} not found`);
      return BOOKING_RESPONSES.BOOKING_NOT_FOUND(id);
    }
    return BOOKING_RESPONSES.BOOKING_FETCHED(booking);
  }
}
