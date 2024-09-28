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

const adminCreateAction = 'Created by Admin';
const adminOverrideAction = 'Overridden by Admin';
const FirstYear = 'FirstYear';
const SecondYear = 'SecondYear';

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
    private readonly logger: LoggerService,
    private readonly bookingUtilService: BookingUtilService,
  ) {}

  async createAdminBooking(
    createBookingDto: CreateBookingDTO,
  ): Promise<Booking | object> {
    this.logger.log('Creating a new admin booking');

    const isLastMinuteBooking = this.bookingUtilService.isLastMinuteBooking(
      createBookingDto.checkinDate,
    );

    const property = await this.propertyRepository.findOne({
      where: { id: createBookingDto.property.id },
    });
    if (!property) {
      return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(property.id);
    }

    await this.overrideExistingBookings(createBookingDto, property);

    const booking = this.bookingRepository.create(createBookingDto);
    booking.bookingId = await generateBookingId(
      this.bookingRepository,
      property.id,
    );
    booking.checkinDate = normalizeDate(createBookingDto.checkinDate);
    booking.checkoutDate = normalizeDate(createBookingDto.checkoutDate);
    const totalNights = this.bookingUtilService.calculateNightsSelected(
      booking.checkinDate,
      booking.checkoutDate,
    );
    booking.isLastMinuteBooking = isLastMinuteBooking;
    booking.totalNights = totalNights;
    const savedBooking = await this.bookingRepository.save(booking);

    await this.updateUserProperties(savedBooking);

    await this.bookingUtilService.createBookingHistory(
      savedBooking,
      createBookingDto.createdBy,
      adminCreateAction,
    );

    return savedBooking;
  }

  private async overrideExistingBookings(
    createBookingDto: CreateBookingDTO,
    property: Property,
  ): Promise<void> {
    const existingBookings = await this.bookingRepository.find({
      where: {
        property: { id: property.id },
        checkinDate: MoreThanOrEqual(createBookingDto.checkinDate),
        checkoutDate: LessThanOrEqual(createBookingDto.checkoutDate),
      },
      relations: ['user', 'property'],
    });

    for (const booking of existingBookings) {
      await this.revertUserProperties(booking);
      booking.isCancelled = true;
      booking.cancelledAt = new Date();
      await this.bookingRepository.save(booking);
      await this.bookingUtilService.createBookingHistory(
        booking,
        createBookingDto.createdBy,
        adminOverrideAction,
      );
    }
  }

  private async revertUserProperties(booking: Booking): Promise<void> {
    const userProperty = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: booking.user.id },
        property: { id: booking.property.id },
        year: booking.checkinDate.getFullYear(),
      },
    });

    if (userProperty) {
      const nightCounts = await this.bookingUtilService.calculateNightCounts(
        booking.property,
        booking.checkinDate,
        booking.checkoutDate,
        await this.bookingUtilService.getPropertyDetails(booking.property),
      );

      if (booking.isLastMinuteBooking) {
        const totalNights =
          nightCounts.peakNightsInFirstYear +
          nightCounts.offNightsInFirstYear +
          nightCounts.peakHolidayNightsInFirstYear +
          nightCounts.offHolidayNightsInFirstYear;
        userProperty.lastMinuteRemainingNights += totalNights;
        userProperty.lastMinuteBookedNights -= totalNights;
      } else {
        this.revertNightCounts(userProperty, nightCounts, FirstYear);
      }

      await this.userPropertiesRepository.save(userProperty);

      if (
        booking.checkinDate.getFullYear() !== booking.checkoutDate.getFullYear()
      ) {
        const userPropertySecondYear =
          await this.userPropertiesRepository.findOne({
            where: {
              user: { id: booking.user.id },
              property: { id: booking.property.id },
              year: booking.checkoutDate.getFullYear(),
            },
          });

        if (userPropertySecondYear) {
          if (booking.isLastMinuteBooking) {
            const totalNights =
              nightCounts.peakNightsInSecondYear +
              nightCounts.offNightsInSecondYear +
              nightCounts.peakHolidayNightsInSecondYear +
              nightCounts.offHolidayNightsInSecondYear;
            userPropertySecondYear.lastMinuteRemainingNights += totalNights;
            userPropertySecondYear.lastMinuteBookedNights -= totalNights;
          } else {
            this.revertNightCounts(
              userPropertySecondYear,
              nightCounts,
              SecondYear,
            );
          }
          await this.userPropertiesRepository.save(userPropertySecondYear);
        }
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
  }

  private revertNightCounts(
    userProperty: UserProperties,
    nightCounts: NightCounts,
    yearType: typeof FirstYear | typeof SecondYear,
  ): void {
    userProperty.peakRemainingNights += nightCounts[`peakNightsIn${yearType}`];
    userProperty.offRemainingNights += nightCounts[`offNightsIn${yearType}`];
    userProperty.peakRemainingHolidayNights +=
      nightCounts[`peakHolidayNightsIn${yearType}`];
    userProperty.offRemainingHolidayNights +=
      nightCounts[`offHolidayNightsIn${yearType}`];

    userProperty.peakBookedNights -= nightCounts[`peakNightsIn${yearType}`];
    userProperty.offBookedNights -= nightCounts[`offNightsIn${yearType}`];
    userProperty.peakBookedHolidayNights -=
      nightCounts[`peakHolidayNightsIn${yearType}`];
    userProperty.offBookedHolidayNights -=
      nightCounts[`offHolidayNightsIn${yearType}`];
  }

  private async revertPeakHoliday(
    year: number,
    nights: number,
    user: User,
    property: Property,
  ): Promise<void> {
    const userProperty = await this.userPropertiesRepository.findOne({
      where: { user: { id: user.id }, property: { id: property.id }, year },
    });
    if (userProperty) {
      userProperty.peakRemainingHolidayNights += nights;
      userProperty.peakBookedHolidayNights -= nights;
      await this.userPropertiesRepository.save(userProperty);
    }
  }

  private async updateUserProperties(booking: Booking): Promise<void> {
    const userProperty = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: booking.user.id },
        property: { id: booking.property.id },
        year: booking.checkinDate.getFullYear(),
      },
    });

    if (userProperty) {
      const nightCounts = await this.bookingUtilService.calculateNightCounts(
        booking.property,
        booking.checkinDate,
        booking.checkoutDate,
        await this.bookingUtilService.getPropertyDetails(booking.property),
      );

      if (booking.isLastMinuteBooking) {
        const totalNights =
          nightCounts.peakNightsInFirstYear +
          nightCounts.offNightsInFirstYear +
          nightCounts.peakHolidayNightsInFirstYear +
          nightCounts.offHolidayNightsInFirstYear;
        userProperty.lastMinuteRemainingNights -= totalNights;
        userProperty.lastMinuteBookedNights += totalNights;
      } else {
        this.bookingUtilService.updateNightCounts(
          userProperty,
          nightCounts,
          FirstYear,
        );
      }
      await this.userPropertiesRepository.save(userProperty);

      if (
        booking.checkinDate.getFullYear() !== booking.checkoutDate.getFullYear()
      ) {
        const userPropertySecondYear =
          await this.userPropertiesRepository.findOne({
            where: {
              user: { id: booking.user.id },
              property: { id: booking.property.id },
              year: booking.checkoutDate.getFullYear(),
            },
          });

        if (userPropertySecondYear) {
          if (booking.isLastMinuteBooking) {
            const totalNights =
              nightCounts.peakNightsInSecondYear +
              nightCounts.offNightsInSecondYear +
              nightCounts.peakHolidayNightsInSecondYear +
              nightCounts.offHolidayNightsInSecondYear;
            userPropertySecondYear.lastMinuteRemainingNights -= totalNights;
            userPropertySecondYear.lastMinuteBookedNights += totalNights;
          } else {
            this.bookingUtilService.updateNightCounts(
              userPropertySecondYear,
              nightCounts,
              SecondYear,
            );
          }
          await this.userPropertiesRepository.save(userPropertySecondYear);
        }
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
  }
}
