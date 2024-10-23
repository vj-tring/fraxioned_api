import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { UpdateBookingDTO } from '../../dto/requests/booking/update-booking.dto';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertyDetails } from '../../entities/property-details.entity';
import { User } from 'src/main/entities/user.entity';
import { BookingUtilService } from 'src/main/utils/booking/booking.service.util';
import { Property } from 'src/main/entities/property.entity';
import { normalizeDates, normalizeDate } from '../../utils/booking/date.util';
import { BookingValidationService } from '../../utils/booking/validation.util';
import { BookingMailService } from '../../utils/booking/mail.util';
import { NightCounts } from 'src/main/commons/interface/booking/night-counts.interface';

const USER_ACTION = 'Updated';
const FIRST_YEAR = 'FirstYear';
const SECOND_YEAR = 'SecondYear';

@Injectable()
export class UpdateBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
    private readonly logger: LoggerService,
    private readonly bookingUtilService: BookingUtilService,
    private readonly bookingValidationService: BookingValidationService,
    private readonly bookingMailService: BookingMailService,
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
      return BOOKING_RESPONSES.BOOKING_NOT_FOUND(updateBookingDto.property.id);
    }

    const {
      checkinDate: newCheckinDateStr,
      checkoutDate: newCheckoutDateStr,
      user,
    } = updateBookingDto;

    const property = await this.bookingUtilService.getProperty(
      existingBooking.property.id,
    );
    const propertyDetails =
      await this.bookingUtilService.getPropertyDetails(property);

    if (!propertyDetails) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    const { checkinDate: newCheckinDate, checkoutDate: newCheckoutDate } =
      normalizeDates(
        newCheckinDateStr || existingBooking.checkinDate,
        newCheckoutDateStr || existingBooking.checkoutDate,
      );

    const dateValidationResult = this.bookingValidationService.validateDates(
      newCheckinDate,
      newCheckoutDate,
      propertyDetails,
    );
    if (dateValidationResult !== true) {
      return dateValidationResult;
    }

    const userPropertyValidationResult =
      await this.bookingValidationService.validateUserProperty(
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

    const nightCounts = await this.bookingUtilService.calculateNightCounts(
      property,
      newCheckinDate,
      newCheckoutDate,
      propertyDetails,
    );

    const isLastMinuteBooking = updateBookingDto.isLastMinuteBooking;

    const nightsSelected = this.bookingUtilService.calculateNightsSelected(
      newCheckinDate,
      newCheckoutDate,
    );

    const bookingValidationResult =
      await this.bookingValidationService.validateBookingRules(
        isLastMinuteBooking,
        nightsSelected,
        nightCounts,
        user || existingBooking.user,
        property,
        newCheckinDate,
        newCheckoutDate,
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

    const updateBooking = await this.getUpdateBooking(
      existingBooking,
      updateBookingDto,
      property,
      propertyDetails,
      isLastMinuteBooking,
      nightsSelected,
    );

    const updatedOwnerRezData =
      await this.bookingUtilService.updateBookingOnOwnerRez(updateBooking);
    if (!updatedOwnerRezData) {
      return BOOKING_RESPONSES.OWNER_REZ_BOOKING_FAILED;
    }

    if (updatedOwnerRezData.data) {
      if (updatedOwnerRezData.data.status_code === 500) {
        return BOOKING_RESPONSES.OWNER_REZ_BOOKING_500;
      }
      if (updatedOwnerRezData.data.status_code === 400) {
        return BOOKING_RESPONSES.OWNER_REZ_BOOKING_400;
      }
      if (updatedOwnerRezData.data.status_code === 404) {
        return BOOKING_RESPONSES.OWNER_REZ_BOOKING_404;
      }
      if (updatedOwnerRezData.data.status_code !== 200) {
        return BOOKING_RESPONSES.OWNER_REZ_BOOKING_FAILED;
      }
    }

    updateBooking.ownerRezBookingId = updatedOwnerRezData['id'];
    if (!updateBooking.ownerRezBookingId) {
      return BOOKING_RESPONSES.OWNER_REZ_BOOKING_ID_NOT_FOUND;
    }

    const updatedBooking = await this.saveBooking(updateBooking);

    await this.bookingMailService.sendBookingModificationEmail(
      updatedBooking,
      this.lastCheckInDate,
      this.lastCheckOutDate,
    );

    await this.bookingUtilService.createBookingHistory(
      updatedBooking,
      updateBookingDto.updatedBy,
      USER_ACTION,
    );

    return BOOKING_RESPONSES.BOOKING_UPDATED(updatedBooking);
  }

  async saveBooking(booking: Booking): Promise<Booking> {
    return this.bookingRepository.save(booking);
  }

  private async getUpdateBooking(
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

    const totalPetFee = updateBookingDto.noOfPets * propertyDetails.feePerPet;
    updatedBooking.cleaningFee = propertyDetails.cleaningFee;
    updatedBooking.petFee = totalPetFee ? totalPetFee : 0.0;
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

    return updatedBooking;
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
      await this.bookingUtilService.calculateNightCounts(
        property,
        existingBooking.checkinDate,
        existingBooking.checkoutDate,
        await this.bookingUtilService.getPropertyDetails(property),
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
        isActive: true,
      },
    });

    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: secondYear,
        isActive: true,
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
        this.bookingUtilService.updateNightCounts(
          userPropertyFirstYear,
          newNightCounts,
          FIRST_YEAR,
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
        this.bookingUtilService.updateNightCounts(
          userPropertySecondYear,
          newNightCounts,
          SECOND_YEAR,
        );
      }
      await this.userPropertiesRepository.save(userPropertySecondYear);
    }

    if (
      newNightCounts.peakHolidayNightsInFirstYear > 0 &&
      !isLastMinuteBooking
    ) {
      await this.bookingUtilService.updatePeakHoliday(
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
      await this.bookingUtilService.updatePeakHoliday(
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
        isActive: true,
      },
    });

    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: {
        user: { id: user.id },
        property: { id: property.id },
        year: secondYear,
        isActive: true,
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
        this.bookingUtilService.revertNightCounts(
          userPropertyFirstYear,
          nightCounts,
          FIRST_YEAR,
        );
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
        this.bookingUtilService.revertNightCounts(
          userPropertySecondYear,
          nightCounts,
          SECOND_YEAR,
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
