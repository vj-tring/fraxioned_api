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
import { CreateBookingService } from './create-booking.service';
import {
  mailSubject,
  mailTemplates,
} from 'src/main/commons/constants/email/mail.constants';
import { format, differenceInDays } from 'date-fns';
import { authConstants } from 'src/main/commons/constants/authentication/authentication.constants';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.constant';
import { NightCounts } from './interface/bookingInterface';

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
    private readonly createBookingService: CreateBookingService,
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

    const property = await this.createBookingService.getProperty(
      existingBooking.property.id,
    );
    const propertyDetails =
      await this.createBookingService.getPropertyDetails(property);

    if (!propertyDetails) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    const nightCounts = await this.createBookingService.calculateNightCounts(
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
    const cancelledBooking = await this.bookingRepository.save(existingBooking);
    await this.sendBookingCancellationEmail(cancelledBooking);

    const userAction = 'Cancelled';
    await this.createBookingService.createBookingHistory(
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
      this.revertNightCounts(userProperty, nightCounts, yearType);
    }
  }

  private revertNightCounts(
    userProperty: UserProperties,
    nightCounts: NightCounts,
    yearType: 'FirstYear' | 'SecondYear',
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

  private async sendBookingCancellationEmail(
    booking: Booking,
  ): Promise<void | Error> {
    try {
      if (!booking || !booking.user || !booking.property) {
        return new Error('Invalid booking data');
      }

      const owner = await this.userRepository.findOne({
        where: { id: booking.user.id },
      });

      if (!owner) {
        return new Error(`Owner not found for user ID: ${booking.user.id}`);
      }

      const contacts = await this.userContactDetailsRepository.find({
        where: { user: { id: booking.user.id } },
        select: ['primaryEmail'],
      });

      if (!contacts || contacts.length === 0) {
        return new Error(
          `Contact details not found for user ID: ${booking.user.id}`,
        );
      }

      const { primaryEmail: email } = contacts[0];
      if (!email) {
        throw new Error(
          `Primary email not found for user ID: ${booking.user.id}`,
        );
      }

      const subject = mailSubject.booking.confirmation;
      const template = mailTemplates.booking.confirmation;
      const context = {
        ownerName: `${owner.firstName} ${owner.lastName}`,
        propertyName: booking.property.propertyName || 'N/A',
        bookingId: booking.bookingId || 'N/A',
        checkIn: booking.checkinDate
          ? format(booking.checkinDate, 'MM/dd/yyyy @ KK:mm aa')
          : 'N/A',
        checkOut: booking.checkoutDate
          ? format(booking.checkoutDate, 'MM/dd/yyyy @ KK:mm aa')
          : 'N/A',
        cancellationDate: format(new Date(), 'MM/dd/yyyy @ KK:mm aa'),
        rebookLink: `${authConstants.hostname}:${authConstants.port}/${authConstants.endpoints.booking}`,
      };

      await this.mailService.sendMail(email, subject, template, context);
      this.logger.log(`Booking cancellation email has been sent to: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking cancellation email: ${error.message}`,
      );
    }
  }
}
