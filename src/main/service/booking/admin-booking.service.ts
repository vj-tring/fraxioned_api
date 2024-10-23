import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { UserProperties } from 'entities/user-properties.entity';
import { Property } from 'entities/property.entity';
import { User } from 'entities/user.entity';
import { BookingHistory } from 'entities/booking-history.entity';
import { LoggerService } from 'services/logger.service';
import { CreateBookingDTO } from '../../dto/requests/booking/create-booking.dto';
import { BookingUtilService } from '../../utils/booking/booking.service.util';
import { normalizeDate } from '../../utils/booking/date.util';
import { generateBookingId } from '../../utils/booking/booking-id.util';
import { NightCounts } from 'src/main/commons/interface/booking/night-counts.interface';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';

const ADMIN_CREATE_ACTION = 'Created by Admin';
const ADMIN_OVERRIDE_ACTION = 'Overridden by Admin';
const FIRST_YEAR = 'FirstYear';
const SECOND_YEAR = 'SecondYear';

@Injectable()
export class AdminBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(BookingHistory)
    private readonly bookingHistoryRepository: Repository<BookingHistory>,
    private readonly logger: LoggerService,
    private readonly bookingUtilService: BookingUtilService,
  ) {}

  async createAdminBooking(
    createBookingDto: CreateBookingDTO,
  ): Promise<Booking | object> {
    this.logger.log('Creating a new admin booking');

    const property = await this.findProperty(createBookingDto.property.id);
    if (!property) {
      return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(
        createBookingDto.property.id,
      );
    }

    await this.overrideExistingBookings(createBookingDto, property);

    const booking = await this.createAndSaveBooking(createBookingDto, property);
    await this.updateUserProperties(booking);
    await this.createBookingHistory(
      booking,
      createBookingDto.createdBy,
      ADMIN_CREATE_ACTION,
    );

    return booking;
  }

  private async findProperty(propertyId: number): Promise<Property | null> {
    return this.propertyRepository.findOne({
      where: { id: propertyId },
    });
  }

  private async createAndSaveBooking(
    createBookingDto: CreateBookingDTO,
    property: Property,
  ): Promise<Booking> {
    const booking = this.bookingRepository.create(createBookingDto);
    booking.bookingId = await generateBookingId(
      this.bookingRepository,
      property.id,
    );
    booking.checkinDate = normalizeDate(createBookingDto.checkinDate);
    booking.checkoutDate = normalizeDate(createBookingDto.checkoutDate);
    booking.totalNights = this.bookingUtilService.calculateNightsSelected(
      booking.checkinDate,
      booking.checkoutDate,
    );
    booking.isLastMinuteBooking = createBookingDto.isLastMinuteBooking;

    return this.bookingRepository.save(booking);
  }

  private async overrideExistingBookings(
    createBookingDto: CreateBookingDTO,
    property: Property,
  ): Promise<void> {
    const existingBookings = await this.findOverlappingBookings(
      createBookingDto,
      property,
    );

    for (const booking of existingBookings) {
      await this.cancelExistingBooking(booking, createBookingDto.createdBy);
    }
  }

  private async findOverlappingBookings(
    createBookingDto: CreateBookingDTO,
    property: Property,
  ): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: {
        property: { id: property.id },
        checkinDate: MoreThanOrEqual(createBookingDto.checkinDate),
        checkoutDate: LessThanOrEqual(createBookingDto.checkoutDate),
      },
      relations: ['user', 'property'],
    });
  }

  private async cancelExistingBooking(
    booking: Booking,
    cancelledBy: User,
  ): Promise<void> {
    await this.revertUserProperties(booking);
    booking.isCancelled = true;
    booking.cancelledAt = new Date();
    await this.bookingRepository.save(booking);
    await this.createBookingHistory(
      booking,
      cancelledBy,
      ADMIN_OVERRIDE_ACTION,
    );
  }

  private async revertUserProperties(booking: Booking): Promise<void> {
    const userProperty = await this.findUserProperty(booking);
    if (!userProperty) return;

    const nightCounts = await this.calculateNightCounts(booking);
    this.updateUserPropertyNights(
      userProperty,
      nightCounts,
      booking.isLastMinuteBooking,
      true,
    );
    await this.userPropertiesRepository.save(userProperty);

    if (this.isBookingSpanningTwoYears(booking)) {
      await this.handleSecondYearProperties(booking, nightCounts);
    }

    if (
      nightCounts.peakHolidayNightsInFirstYear > 0 &&
      !booking.isLastMinuteBooking
    ) {
      await this.revertPeakHoliday(
        booking.checkinDate.getFullYear(),
        nightCounts.peakHolidayNightsInFirstYear,
        booking.user,
        booking.property,
      );
    }
    if (
      nightCounts.peakHolidayNightsInSecondYear > 0 &&
      !booking.isLastMinuteBooking
    ) {
      await this.revertPeakHoliday(
        booking.checkoutDate.getFullYear(),
        nightCounts.peakHolidayNightsInSecondYear,
        booking.user,
        booking.property,
      );
    }
  }

  private async findUserProperty(
    booking: Booking,
  ): Promise<UserProperties | null> {
    return this.userPropertiesRepository.findOne({
      where: {
        user: { id: booking.user.id },
        property: { id: booking.property.id },
        year: booking.checkinDate.getFullYear(),
        isActive: true,
      },
    });
  }

  private async calculateNightCounts(booking: Booking): Promise<NightCounts> {
    const propertyDetails = await this.bookingUtilService.getPropertyDetails(
      booking.property,
    );
    return this.bookingUtilService.calculateNightCounts(
      booking.property,
      booking.checkinDate,
      booking.checkoutDate,
      propertyDetails,
    );
  }

  private updateUserPropertyNights(
    userProperty: UserProperties,
    nightCounts: NightCounts,
    isLastMinuteBooking: boolean,
    isRevert: boolean,
  ): void {
    const factor = isRevert ? 1 : -1;
    if (isLastMinuteBooking) {
      const totalNights = this.calculateTotalNights(nightCounts, FIRST_YEAR);
      userProperty.lastMinuteRemainingNights += totalNights * factor;
      userProperty.lastMinuteBookedNights -= totalNights * factor;
    } else {
      this.updateNightCounts(userProperty, nightCounts, FIRST_YEAR, factor);
    }
  }

  private calculateTotalNights(
    nightCounts: NightCounts,
    yearType: typeof FIRST_YEAR | typeof SECOND_YEAR,
  ): number {
    return (
      nightCounts[`peakNightsIn${yearType}`] +
      nightCounts[`offNightsIn${yearType}`] +
      nightCounts[`peakHolidayNightsIn${yearType}`] +
      nightCounts[`offHolidayNightsIn${yearType}`]
    );
  }

  private updateNightCounts(
    userProperty: UserProperties,
    nightCounts: NightCounts,
    yearType: typeof FIRST_YEAR | typeof SECOND_YEAR,
    factor: number,
  ): void {
    userProperty.peakRemainingNights +=
      nightCounts[`peakNightsIn${yearType}`] * factor;
    userProperty.offRemainingNights +=
      nightCounts[`offNightsIn${yearType}`] * factor;
    userProperty.peakRemainingHolidayNights +=
      nightCounts[`peakHolidayNightsIn${yearType}`] * factor;
    userProperty.offRemainingHolidayNights +=
      nightCounts[`offHolidayNightsIn${yearType}`] * factor;

    userProperty.peakBookedNights -=
      nightCounts[`peakNightsIn${yearType}`] * factor;
    userProperty.offBookedNights -=
      nightCounts[`offNightsIn${yearType}`] * factor;
    userProperty.peakBookedHolidayNights -=
      nightCounts[`peakHolidayNightsIn${yearType}`] * factor;
    userProperty.offBookedHolidayNights -=
      nightCounts[`offHolidayNightsIn${yearType}`] * factor;
  }

  private isBookingSpanningTwoYears(booking: Booking): boolean {
    return (
      booking.checkinDate.getFullYear() !== booking.checkoutDate.getFullYear()
    );
  }

  private async handleSecondYearProperties(
    booking: Booking,
    nightCounts: NightCounts,
  ): Promise<void> {
    const userPropertySecondYear = await this.findUserProperty({
      ...booking,
      checkinDate: new Date(booking.checkoutDate.getFullYear(), 0, 1),
    });

    if (userPropertySecondYear) {
      this.updateUserPropertyNights(
        userPropertySecondYear,
        nightCounts,
        booking.isLastMinuteBooking,
        true,
      );
      await this.userPropertiesRepository.save(userPropertySecondYear);
    }
  }

  private async revertPeakHoliday(
    year: number,
    nights: number,
    user: User,
    property: Property,
  ): Promise<void> {
    const userProperty = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year,
        isActive: true,
      },
    });
    if (userProperty) {
      userProperty.peakRemainingHolidayNights += nights;
      userProperty.peakBookedHolidayNights -= nights;
      await this.userPropertiesRepository.save(userProperty);
    }
  }

  private async updateUserProperties(booking: Booking): Promise<void> {
    const userProperty = await this.findUserProperty(booking);
    if (!userProperty) return;

    const nightCounts = await this.calculateNightCounts(booking);
    this.updateUserPropertyNights(
      userProperty,
      nightCounts,
      booking.isLastMinuteBooking,
      false,
    );
    await this.userPropertiesRepository.save(userProperty);

    if (this.isBookingSpanningTwoYears(booking)) {
      await this.handleSecondYearProperties(booking, nightCounts);
    }

    if (
      nightCounts.peakHolidayNightsInFirstYear > 0 &&
      !booking.isLastMinuteBooking
    ) {
      await this.bookingUtilService.updatePeakHoliday(
        booking.checkinDate.getFullYear(),
        nightCounts.peakHolidayNightsInFirstYear,
        booking.user,
        booking.property,
      );
    }
    if (
      nightCounts.peakHolidayNightsInSecondYear > 0 &&
      !booking.isLastMinuteBooking
    ) {
      await this.bookingUtilService.updatePeakHoliday(
        booking.checkoutDate.getFullYear(),
        nightCounts.peakHolidayNightsInSecondYear,
        booking.user,
        booking.property,
      );
    }
  }

  private async createBookingHistory(
    booking: Booking,
    createdBy: User,
    action: string,
  ): Promise<void> {
    await this.bookingUtilService.createBookingHistory(
      booking,
      createdBy,
      action,
    );
  }
}
