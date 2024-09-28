import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { UserProperties } from 'entities/user-properties.entity';
import { MailService } from 'src/main/email/mail.service';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { differenceInDays } from 'date-fns';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.constant';
import { BookingUtilService } from '../../utils/booking/booking.service.util';
import { BookingMailService } from '../../utils/booking/mail.util';
import { NightCounts } from 'src/main/commons/interface/booking/night-counts.interface';

@Injectable()
export class CancelBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
    @InjectRepository(UserContactDetails)
    private readonly userContactDetailsRepository: Repository<UserContactDetails>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
    private readonly mailService: MailService,
    private readonly bookingUtilService: BookingUtilService,
    private readonly bookingMailService: BookingMailService,
  ) {}

  async cancelBooking(id: number, user: number): Promise<object> {
    this.logger.log(`Cancelling booking with ID: ${id}`);

    const cancelledBy = await this.userRepository.findOne({
      where: { id: user },
    });

    if (!cancelledBy) {
      return USER_RESPONSES.USER_NOT_FOUND;
    }

    const existingBooking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'property'],
    });

    if (!existingBooking) {
      return BOOKING_RESPONSES.BOOKING_NOT_FOUND(existingBooking.id || 0);
    }

    const cancellationValidation =
      await this.validateCancellation(existingBooking);
    if (cancellationValidation !== true) {
      return cancellationValidation;
    }

    const property = await this.bookingUtilService.getProperty(
      existingBooking.property.id,
    );
    const propertyDetails =
      await this.bookingUtilService.getPropertyDetails(property);

    if (!propertyDetails) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    const nightCounts = await this.bookingUtilService.calculateNightCounts(
      property,
      existingBooking.checkinDate,
      existingBooking.checkoutDate,
      propertyDetails,
    );

    const currentDate = new Date();
    const daysUntilCheckin = differenceInDays(
      existingBooking.checkinDate,
      currentDate,
    );

    await this.handleUserProperties(
      existingBooking.user,
      property,
      existingBooking.checkinDate,
      existingBooking.checkoutDate,
      nightCounts,
      existingBooking.isLastMinuteBooking,
      daysUntilCheckin <= 7,
    );

    existingBooking.isCancelled = true;
    existingBooking.cancelledAt = new Date();
    const cancelledBooking = await this.bookingRepository.save(existingBooking);

    await this.bookingMailService.sendBookingCancellationEmail(
      cancelledBooking,
    );

    const userAction = 'Cancelled';
    await this.bookingUtilService.createBookingHistory(
      cancelledBooking,
      cancelledBy,
      userAction,
    );

    return BOOKING_RESPONSES.BOOKING_CANCELLED(cancelledBooking);
  }

  private async validateCancellation(booking: Booking): Promise<true | object> {
    const currentDate = new Date();
    const checkinDate = new Date(booking.checkinDate);

    if (booking.isCancelled === true) {
      return BOOKING_RESPONSES.BOOKING_ALREADY_CANCELLED_OR_COMPLETED;
    }

    if (booking.isCompleted === true) {
      return BOOKING_RESPONSES.BOOKING_ALREADY_CANCELLED_OR_COMPLETED;
    }

    if (checkinDate < currentDate) {
      return BOOKING_RESPONSES.CANNOT_CANCEL_PAST_BOOKING;
    }

    if (booking.isLastMinuteBooking) {
      return BOOKING_RESPONSES.CANNOT_CANCEL_LAST_MINUTE_BOOKING;
    }

    return true;
  }

  private async handleUserProperties(
    user: User,
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
    nightCounts: NightCounts,
    isLastMinuteBooking: boolean,
    isLateCancellation: boolean,
  ): Promise<void> {
    const firstYear = checkinDate.getFullYear();
    const secondYear = checkoutDate.getFullYear();

    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: { user: { id: user.id }, property, year: firstYear },
    });

    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: { user: { id: user.id }, property, year: secondYear },
    });

    if (userPropertyFirstYear) {
      this.handleRegularBooking(
        userPropertyFirstYear,
        nightCounts,
        'FirstYear',
        isLateCancellation,
      );
      await this.userPropertiesRepository.save(userPropertyFirstYear);
    }

    if (userPropertySecondYear && firstYear != secondYear) {
      this.handleRegularBooking(
        userPropertySecondYear,
        nightCounts,
        'SecondYear',
        isLateCancellation,
      );
      await this.userPropertiesRepository.save(userPropertySecondYear);
    }

    if (nightCounts.peakHolidayNightsInFirstYear > 0 && !isLastMinuteBooking) {
      await this.handlePeakHoliday(
        firstYear,
        nightCounts.peakHolidayNightsInFirstYear,
        user,
        property,
        isLateCancellation,
      );
    }
    if (nightCounts.peakHolidayNightsInSecondYear > 0 && !isLastMinuteBooking) {
      await this.handlePeakHoliday(
        secondYear,
        nightCounts.peakHolidayNightsInSecondYear,
        user,
        property,
        isLateCancellation,
      );
    }
  }

  private handleRegularBooking(
    userProperty: UserProperties,
    nightCounts: NightCounts,
    yearType: 'FirstYear' | 'SecondYear',
    isLateCancellation: boolean,
  ): void {
    if (isLateCancellation) {
      this.addToLostNights(userProperty, nightCounts, yearType);
    } else {
      this.bookingUtilService.revertNightCounts(
        userProperty,
        nightCounts,
        yearType,
      );
    }
  }

  private addToLostNights(
    userProperty: UserProperties,
    nightCounts: NightCounts,
    yearType: 'FirstYear' | 'SecondYear',
  ): void {
    userProperty.peakLostNights += nightCounts[`peakNightsIn${yearType}`];
    userProperty.offLostNights += nightCounts[`offNightsIn${yearType}`];
    userProperty.peakLostHolidayNights +=
      nightCounts[`peakHolidayNightsIn${yearType}`];
    userProperty.offLostHolidayNights +=
      nightCounts[`offHolidayNightsIn${yearType}`];

    userProperty.peakBookedNights -= nightCounts[`peakNightsIn${yearType}`];
    userProperty.offBookedNights -= nightCounts[`offNightsIn${yearType}`];
    userProperty.peakBookedHolidayNights -=
      nightCounts[`peakHolidayNightsIn${yearType}`];
    userProperty.offBookedHolidayNights -=
      nightCounts[`offHolidayNightsIn${yearType}`];
  }

  private async handlePeakHoliday(
    year: number,
    nights: number,
    user: User,
    property: Property,
    isLateCancellation: boolean,
  ): Promise<void> {
    const userProperty = await this.userPropertiesRepository.findOne({
      where: { user, property, year },
    });
    if (userProperty) {
      if (isLateCancellation) {
        userProperty.peakLostHolidayNights += nights;
      } else {
        userProperty.peakRemainingHolidayNights += nights;
      }
      userProperty.peakBookedHolidayNights -= nights;
      await this.userPropertiesRepository.save(userProperty);
    }
  }
}
