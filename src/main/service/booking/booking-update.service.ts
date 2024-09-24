import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { UpdateBookingDTO } from '../../dto/requests/booking/update-booking.dto';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertyDetails } from '../../entities/property-details.entity';
import { MailService } from 'src/main/email/mail.service';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import { normalizeDate } from 'src/main/service/booking/utils/booking.util';
import { Property } from 'src/main/entities/property.entity';
import { NightCounts } from './interface/bookingInterface';
import { CreateBookingService } from './create-booking.service';
import {
  mailSubject,
  mailTemplates,
} from 'src/main/commons/constants/email/mail.constants';
import { PropertyImages } from 'src/main/entities/property_images.entity';
import { SpaceTypes } from 'src/main/entities/space-types.entity';
@Injectable()
export class UpdateBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
    @InjectRepository(UserContactDetails)
    private readonly userContactDetailsRepository: Repository<UserContactDetails>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PropertyImages)
    private readonly propertyImagesRepository: Repository<PropertyImages>,
    @InjectRepository(SpaceTypes)
    private readonly spaceTypesRepository: Repository<SpaceTypes>,
    private readonly logger: LoggerService,
    private readonly mailService: MailService,
    private readonly createBookingService: CreateBookingService,
  ) {}

  private lastCheckInDate: Date;
  private lastCheckOutDate: Date;

  async updateBooking(
    id: number,
    updateBookingDto: UpdateBookingDTO,
  ): Promise<object> {
    this.logger.log(`Updating booking with ID: ${id}`);

    const existingBooking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'property'],
    });

    this.lastCheckInDate = existingBooking.checkinDate;
    this.lastCheckOutDate = existingBooking.checkoutDate;

    if (!existingBooking) {
      return BOOKING_RESPONSES.BOOKING_NOT_FOUND;
    }

    const {
      checkinDate: newCheckinDateStr,
      checkoutDate: newCheckoutDateStr,
      user,
    } = updateBookingDto;

    const property = await this.createBookingService.getProperty(
      existingBooking.property.id,
    );
    const propertyDetails =
      await this.createBookingService.getPropertyDetails(property);

    if (!propertyDetails) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    const { checkinDate: newCheckinDate, checkoutDate: newCheckoutDate } =
      this.createBookingService.normalizeDates(
        newCheckinDateStr || existingBooking.checkinDate,
        newCheckoutDateStr || existingBooking.checkoutDate,
      );

    const dateValidationResult = this.createBookingService.validateDates(
      newCheckinDate,
      newCheckoutDate,
      propertyDetails,
    );
    if (dateValidationResult !== true) {
      return dateValidationResult;
    }

    const userPropertyValidationResult =
      await this.createBookingService.validateUserProperty(
        user || existingBooking.user,
        property,
        newCheckinDate,
        newCheckoutDate,
      );
    if (userPropertyValidationResult !== true) {
      return userPropertyValidationResult;
    }

    const guestValidationResult = this.validateGuestLimits(
      updateBookingDto,
      propertyDetails,
      existingBooking,
    );
    if (guestValidationResult !== true) {
      return guestValidationResult;
    }

    const bookingGapValidationResult = await this.validateBookingGap(
      user || existingBooking.user,
      property,
      newCheckinDate,
      newCheckoutDate,
      existingBooking,
    );
    if (bookingGapValidationResult !== true) {
      return bookingGapValidationResult;
    }

    const bookedDatesValidationResult = await this.validateBookedDates(
      property,
      newCheckinDate,
      newCheckoutDate,
      existingBooking,
    );
    if (bookedDatesValidationResult !== true) {
      return bookedDatesValidationResult;
    }

    const nightCounts = await this.createBookingService.calculateNightCounts(
      property,
      newCheckinDate,
      newCheckoutDate,
      propertyDetails,
    );

    const isLastMinuteBooking =
      this.createBookingService.isLastMinuteBooking(newCheckinDate);
    const nightsSelected = this.createBookingService.calculateNightsSelected(
      newCheckinDate,
      newCheckoutDate,
    );

    const bookingValidationResult =
      await this.createBookingService.validateBookingRules(
        isLastMinuteBooking,
        nightsSelected,
        nightCounts,
        user || existingBooking.user,
        property,
        newCheckinDate,
      );
    if (bookingValidationResult !== true) {
      return bookingValidationResult;
    }

    await this.updateUserProperties(
      user || existingBooking.user,
      property,
      newCheckinDate,
      newCheckoutDate,
      nightCounts,
      isLastMinuteBooking,
      existingBooking,
    );

    const updatedBooking = await this.saveUpdatedBooking(
      existingBooking,
      updateBookingDto,
      property,
      propertyDetails,
      isLastMinuteBooking,
      nightsSelected,
    );

    await this.sendBookingModificationEmail(updatedBooking);

    const userAction = 'Updated';
    await this.createBookingService.createBookingHistory(
      updatedBooking,
      updateBookingDto.updatedBy,
      userAction,
    );

    return BOOKING_RESPONSES.BOOKING_UPDATED(updatedBooking);
  }

  private async saveUpdatedBooking(
    existingBooking: Booking,
    updateBookingDto: UpdateBookingDTO,
    property: Property,
    propertyDetails: PropertyDetails,
    isLastMinuteBooking: boolean,
    nightsSelected: number,
  ): Promise<Booking> {
    const updatedBooking = this.bookingRepository.merge(
      existingBooking,
      updateBookingDto,
    );

    updatedBooking.cleaningFee = propertyDetails.cleaningFee;
    updatedBooking.petFee =
      updateBookingDto.noOfPets * propertyDetails.feePerPet;
    updatedBooking.isLastMinuteBooking = isLastMinuteBooking;
    updatedBooking.totalNights = nightsSelected;

    if (updateBookingDto.checkinDate) {
      updatedBooking.checkinDate = new Date(updateBookingDto.checkinDate);
      updatedBooking.checkinDate.setHours(propertyDetails.checkInTime, 0, 0, 0);
    }

    if (updateBookingDto.checkoutDate) {
      updatedBooking.checkoutDate = new Date(updateBookingDto.checkoutDate);
      updatedBooking.checkoutDate.setHours(
        propertyDetails.checkOutTime,
        0,
        0,
        0,
      );
    }

    return this.bookingRepository.save(updatedBooking);
  }

  private async updateUserProperties(
    user: User,
    property: Property,
    newCheckinDate: Date,
    newCheckoutDate: Date,
    newNightCounts: NightCounts,
    isLastMinuteBooking: boolean,
    existingBooking: Booking,
  ): Promise<void> {
    const existingNightCounts =
      await this.createBookingService.calculateNightCounts(
        property,
        existingBooking.checkinDate,
        existingBooking.checkoutDate,
        await this.createBookingService.getPropertyDetails(property),
      );

    await this.revertUserProperties(
      user,
      property,
      existingBooking.checkinDate,
      existingBooking.checkoutDate,
      existingNightCounts,
      existingBooking.isLastMinuteBooking,
    );

    const firstYear = newCheckinDate.getFullYear();
    const secondYear = newCheckoutDate.getFullYear();

    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: firstYear,
      },
    });

    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: secondYear,
      },
    });

    if (userPropertyFirstYear) {
      if (isLastMinuteBooking) {
        const totalNightsFirstYear =
          newNightCounts.peakNightsInFirstYear +
          newNightCounts.offNightsInFirstYear;
        userPropertyFirstYear.lastMinuteRemainingNights -= totalNightsFirstYear;
        userPropertyFirstYear.lastMinuteBookedNights += totalNightsFirstYear;
      } else {
        this.createBookingService.updateNightCounts(
          userPropertyFirstYear,
          newNightCounts,
          'FirstYear',
        );
      }
      await this.userPropertiesRepository.save(userPropertyFirstYear);
    }

    if (userPropertySecondYear && firstYear != secondYear) {
      if (isLastMinuteBooking) {
        const totalNightsSecondYear =
          newNightCounts.peakNightsInSecondYear +
          newNightCounts.offNightsInSecondYear;
        userPropertySecondYear.lastMinuteRemainingNights -=
          totalNightsSecondYear;
        userPropertySecondYear.lastMinuteBookedNights += totalNightsSecondYear;
      } else {
        this.createBookingService.updateNightCounts(
          userPropertySecondYear,
          newNightCounts,
          'SecondYear',
        );
      }
      await this.userPropertiesRepository.save(userPropertySecondYear);
    }

    if (
      newNightCounts.peakHolidayNightsInFirstYear > 0 &&
      !isLastMinuteBooking
    ) {
      await this.createBookingService.updatePeakHoliday(
        firstYear,
        newNightCounts.peakHolidayNightsInFirstYear,
        user,
        property,
      );
    }
    if (
      newNightCounts.peakHolidayNightsInSecondYear > 0 &&
      !isLastMinuteBooking
    ) {
      await this.createBookingService.updatePeakHoliday(
        secondYear,
        newNightCounts.peakHolidayNightsInSecondYear,
        user,
        property,
      );
    }
  }

  private async revertUserProperties(
    user: User,
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
    nightCounts: NightCounts,
    isLastMinuteBooking: boolean,
  ): Promise<void> {
    const firstYear = checkinDate.getFullYear();
    const secondYear = checkoutDate.getFullYear();

    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: firstYear,
      },
    });

    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: secondYear,
      },
    });

    if (userPropertyFirstYear) {
      if (isLastMinuteBooking) {
        const totalNightsFirstYear =
          nightCounts.peakNightsInFirstYear +
          nightCounts.offNightsInFirstYear +
          nightCounts.offHolidayNightsInFirstYear +
          nightCounts.peakHolidayNightsInFirstYear;
        userPropertyFirstYear.lastMinuteRemainingNights += totalNightsFirstYear;
        userPropertyFirstYear.lastMinuteBookedNights -= totalNightsFirstYear;
      } else {
        this.revertNightCounts(userPropertyFirstYear, nightCounts, 'FirstYear');
      }
      await this.userPropertiesRepository.save(userPropertyFirstYear);
    }

    if (userPropertySecondYear && firstYear != secondYear) {
      if (isLastMinuteBooking) {
        const totalNightsSecondYear =
          nightCounts.peakNightsInSecondYear +
          nightCounts.offNightsInSecondYear +
          nightCounts.peakHolidayNightsInSecondYear +
          nightCounts.offHolidayNightsInSecondYear;
        userPropertySecondYear.lastMinuteRemainingNights +=
          totalNightsSecondYear;
        userPropertySecondYear.lastMinuteBookedNights -= totalNightsSecondYear;
      } else {
        this.revertNightCounts(
          userPropertySecondYear,
          nightCounts,
          'SecondYear',
        );
      }
      await this.userPropertiesRepository.save(userPropertySecondYear);
    }

    if (nightCounts.peakHolidayNightsInFirstYear > 0 && !isLastMinuteBooking) {
      await this.revertPeakHoliday(
        firstYear,
        nightCounts.peakHolidayNightsInFirstYear,
        user,
        property,
      );
    }
    if (nightCounts.peakHolidayNightsInSecondYear > 0 && !isLastMinuteBooking) {
      await this.revertPeakHoliday(
        secondYear,
        nightCounts.peakHolidayNightsInSecondYear,
        user,
        property,
      );
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

    userProperty.peakBookedNights -= userProperty.peakBookedNights -=
      nightCounts[`peakNightsIn${yearType}`];
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

  private async sendBookingModificationEmail(
    booking: Booking,
  ): Promise<void | Error> {
    try {
      if (!booking || !booking.user || !booking.property) {
        return new Error('Invalid booking data');
      }

      if (!this.lastCheckInDate || !this.lastCheckOutDate) {
        return new Error('Invalid existing booking date');
      }

      const owner = await this.userRepository.findOne({
        where: { id: booking.user.id },
      });

      if (!owner) {
        return new Error(`Owner not found for user ID: ${booking.user.id}`);
      }

      const email = await this.createBookingService.getPrimaryEmail(booking);

      if (!email) {
        throw new Error(
          `Primary email not found for user ID: ${booking.user.id}`,
        );
      }

      const imageUrl = await this.createBookingService.getBannerImage(booking);

      const propertyName = await this.createBookingService.getProperty(
        booking.property.id,
      );

      const subject = mailSubject.booking.modification;
      const template = mailTemplates.booking.modification;
      const context = await this.createBookingService.createEmailContext(
        booking,
        propertyName,
        owner,
        imageUrl,
        this.lastCheckInDate,
        this.lastCheckOutDate,
      );

      await this.mailService.sendMail(email, subject, template, context);
      this.logger.log(
        `Booking update confirmation email has been sent to: ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking update confirmation email: ${error.message}`,
      );
    }
  }

  private async validateBookedDates(
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
    existingBooking: Booking,
  ): Promise<true | object> {
    const bookedDates = await this.bookingRepository.find({
      where: { property: property },
      select: [
        'id',
        'checkinDate',
        'checkoutDate',
        'isCompleted',
        'isCancelled',
      ],
    });

    const isBookedDate = (date: Date): boolean =>
      bookedDates.some(
        (booking) =>
          booking.id !== existingBooking.id &&
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

  private async validateBookingGap(
    user: User,
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
    existingBooking: Booking,
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
      if (booking.id === existingBooking.id) {
        continue;
      }

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

  private validateGuestLimits(
    updateBookingDto: UpdateBookingDTO,
    propertyDetails: PropertyDetails,
    existingBooking: Booking,
  ): true | object {
    const noOfGuests =
      updateBookingDto.noOfGuests ?? existingBooking.noOfGuests;
    const noOfPets = updateBookingDto.noOfPets ?? existingBooking.noOfPets;

    if (
      noOfGuests > propertyDetails.noOfGuestsAllowed ||
      noOfPets > propertyDetails.noOfPetsAllowed
    ) {
      return BOOKING_RESPONSES.GUESTS_LIMIT_EXCEEDS;
    }

    return true;
  }
}
