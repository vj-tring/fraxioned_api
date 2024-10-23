import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { BookingHistory } from 'entities/booking-history.entity';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertySeasonHolidays } from 'entities/property-season-holidays.entity';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { isDateInRange, normalizeDate } from './date.util';
import { NightCounts } from 'src/main/commons/interface/booking/night-counts.interface';
import {
  createBooking,
  updateBooking,
} from 'src/main/integrations/ownerrez/apis/owner-rez-endpoints';
import { format } from 'date-fns';
import { AxiosResponse } from 'axios';
import { LoggerService } from 'src/main/service/logger.service';

const FirstYear = 'FirstYear';
const SecondYear = 'SecondYear';

@Injectable()
export class BookingUtilService {
  constructor(
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(PropertySeasonHolidays)
    private readonly propertySeasonHolidaysRepository: Repository<PropertySeasonHolidays>,
    @InjectRepository(BookingHistory)
    private readonly bookingHistoryRepository: Repository<BookingHistory>,
    private readonly logger: LoggerService,
  ) {}

  async getProperty(propertyId: number): Promise<Property> {
    return this.propertyRepository.findOne({ where: { id: propertyId } });
  }

  async getPropertyDetails(property: Property): Promise<PropertyDetails> {
    return this.propertyDetailsRepository.findOne({
      where: { property: { id: property.id } },
    });
  }

  async calculateNightCounts(
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
    propertyDetails: PropertyDetails,
  ): Promise<{
    peakNightsInFirstYear: number;
    offNightsInFirstYear: number;
    peakHolidayNightsInFirstYear: number;
    offHolidayNightsInFirstYear: number;
    peakNightsInSecondYear: number;
    offNightsInSecondYear: number;
    peakHolidayNightsInSecondYear: number;
    offHolidayNightsInSecondYear: number;
  }> {
    const PropertyHolidays = await this.propertySeasonHolidaysRepository.find({
      where: { property: property },
      relations: ['holiday'],
    });

    const peakSeasonStart = normalizeDate(
      new Date(propertyDetails.peakSeasonStartDate),
    );
    const peakSeasonEnd = normalizeDate(
      new Date(propertyDetails.peakSeasonEndDate),
    );

    let peakNightsInFirstYear = 0;
    let offNightsInFirstYear = 0;
    let peakHolidayNightsInFirstYear = 0;
    let offHolidayNightsInFirstYear = 0;

    let peakNightsInSecondYear = 0;
    let offNightsInSecondYear = 0;
    let peakHolidayNightsInSecondYear = 0;
    let offHolidayNightsInSecondYear = 0;

    const countedHolidays = new Set<number>();

    const getCalendarYear = (date: Date): number => {
      if (date.getMonth() === 11 && date.getDate() === 31) {
        return date.getFullYear() + 1;
      }
      return date.getFullYear();
    };

    const firstYear = getCalendarYear(checkinDate);

    for (
      let date = new Date(checkinDate);
      date < checkoutDate;
      date.setDate(date.getDate() + 1)
    ) {
      const currentYear = getCalendarYear(date);

      PropertyHolidays.forEach((PropertyHoliday) => {
        if (
          date >= normalizeDate(PropertyHoliday.holiday.startDate) &&
          date <= normalizeDate(PropertyHoliday.holiday.endDate)
        ) {
          if (!countedHolidays.has(PropertyHoliday.holiday.id)) {
            countedHolidays.add(PropertyHoliday.holiday.id);
            if (isDateInRange(date, peakSeasonStart, peakSeasonEnd)) {
              if (currentYear === firstYear) {
                peakHolidayNightsInFirstYear++;
              } else {
                peakHolidayNightsInSecondYear++;
              }
            } else {
              if (currentYear === firstYear) {
                offHolidayNightsInFirstYear++;
              } else {
                offHolidayNightsInSecondYear++;
              }
            }
          }
        }
      });

      if (!countedHolidays.has(date.getTime())) {
        if (isDateInRange(date, peakSeasonStart, peakSeasonEnd)) {
          if (currentYear === firstYear) {
            peakNightsInFirstYear++;
          } else {
            peakNightsInSecondYear++;
          }
        } else {
          if (currentYear === firstYear) {
            offNightsInFirstYear++;
          } else {
            offNightsInSecondYear++;
          }
        }
      }
    }

    return {
      peakNightsInFirstYear,
      offNightsInFirstYear,
      peakHolidayNightsInFirstYear,
      offHolidayNightsInFirstYear,
      peakNightsInSecondYear,
      offNightsInSecondYear,
      peakHolidayNightsInSecondYear,
      offHolidayNightsInSecondYear,
    };
  }
  calculateNightsSelected(checkinDate: Date, checkoutDate: Date): number {
    return (
      (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  async updateUserProperties(
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
          nightCounts.peakNightsInFirstYear + nightCounts.offNightsInFirstYear;
        userPropertyFirstYear.lastMinuteRemainingNights -= totalNightsFirstYear;
        userPropertyFirstYear.lastMinuteBookedNights += totalNightsFirstYear;
      } else {
        this.updateNightCounts(userPropertyFirstYear, nightCounts, FirstYear);
      }
      await this.userPropertiesRepository.save(userPropertyFirstYear);
    }

    if (userPropertySecondYear && firstYear != secondYear) {
      if (isLastMinuteBooking) {
        const totalNightsSecondYear =
          nightCounts.peakNightsInSecondYear +
          nightCounts.offNightsInSecondYear;
        userPropertySecondYear.lastMinuteRemainingNights -=
          totalNightsSecondYear;
        userPropertySecondYear.lastMinuteBookedNights += totalNightsSecondYear;
      } else {
        this.updateNightCounts(userPropertySecondYear, nightCounts, SecondYear);
      }
      await this.userPropertiesRepository.save(userPropertySecondYear);
    }

    if (nightCounts.peakHolidayNightsInFirstYear > 0 && !isLastMinuteBooking) {
      await this.updatePeakHoliday(
        firstYear,
        nightCounts.peakHolidayNightsInFirstYear,
        user,
        property,
      );
    }
    if (nightCounts.peakHolidayNightsInSecondYear > 0 && !isLastMinuteBooking) {
      await this.updatePeakHoliday(
        secondYear,
        nightCounts.peakHolidayNightsInSecondYear,
        user,
        property,
      );
    }
  }

  updateNightCounts(
    userProperty: UserProperties,
    nightCounts: NightCounts,
    yearType: typeof FirstYear | typeof SecondYear,
  ): void {
    userProperty.peakRemainingNights -= nightCounts[`peakNightsIn${yearType}`];
    userProperty.offRemainingNights -= nightCounts[`offNightsIn${yearType}`];
    userProperty.peakRemainingHolidayNights -=
      nightCounts[`peakHolidayNightsIn${yearType}`];
    userProperty.offRemainingHolidayNights -=
      nightCounts[`offHolidayNightsIn${yearType}`];

    userProperty.peakBookedNights += nightCounts[`peakNightsIn${yearType}`];
    userProperty.offBookedNights += nightCounts[`offNightsIn${yearType}`];
    userProperty.peakBookedHolidayNights +=
      nightCounts[`peakHolidayNightsIn${yearType}`];
    userProperty.offBookedHolidayNights +=
      nightCounts[`offHolidayNightsIn${yearType}`];
  }

  revertNightCounts(
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

  async updatePeakHoliday(
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

    if (!userProperty) {
      return;
    }

    const today = new Date();
    const acquisitionYear = userProperty.acquisitionDate.getFullYear();
    const currentYearForValidation = today.getFullYear();
    const diffOfAcquisitionAndCheckInYear = year - acquisitionYear + 1;
    const isEven = diffOfAcquisitionAndCheckInYear % 2 === 0;

    let targetYear: number | undefined;

    if (
      !isEven &&
      (currentYearForValidation === year ||
        currentYearForValidation + 1 === year)
    ) {
      targetYear = year + 1;
    } else if (
      isEven &&
      (currentYearForValidation + 1 === year ||
        currentYearForValidation + 2 === year)
    ) {
      targetYear = year - 1;
    }

    if (targetYear) {
      const userPropertyToUpdate = await this.userPropertiesRepository.findOne({
        where: {
          user: { id: user.id },
          property: { id: property.id },
          year: targetYear,
          isActive: true,
        },
      });

      if (userPropertyToUpdate) {
        userPropertyToUpdate.peakRemainingHolidayNights -= nights;
        userPropertyToUpdate.peakBookedHolidayNights += nights;
        await this.userPropertiesRepository.save(userPropertyToUpdate);
      }
    }
  }

  async createBookingHistory(
    booking: Booking,
    createdBy: User,
    userAction: string,
  ): Promise<void> {
    const bookingHistory = this.bookingHistoryRepository.create({
      bookingId: booking.bookingId,
      user: booking.user,
      property: booking.property,
      userAction: userAction,
      checkinDate: booking.checkinDate,
      checkoutDate: booking.checkoutDate,
      noOfGuests: booking.noOfGuests,
      noOfPets: booking.noOfPets,
      isLastMinuteBooking: booking.isLastMinuteBooking,
      noOfAdults: booking.noOfAdults,
      noOfChildren: booking.noOfChildren,
      notes: booking.notes,
      confirmationCode: booking.confirmationCode,
      cleaningFee: booking.cleaningFee,
      petFee: booking.petFee,
      createdBy: createdBy,
      modifiedBy: createdBy,
      isCancelled: booking.isCancelled,
      isCompleted: booking.isCompleted,
      cancelledAt: booking.cancelledAt,
    });

    await this.bookingHistoryRepository.save(bookingHistory);
  }

  async createBookingOnOwnerRez(booking: Booking): Promise<AxiosResponse> {
    try {
      const formatBooking = await this.formatBooking(booking);
      const ownerRezData = await createBooking(formatBooking);
      if (!ownerRezData) {
        this.logger.log(`Empty response data received from the OwnerRez`);
        return;
      }
      return ownerRezData;
    } catch (error) {
      this.logger.error(
        `Error creating booking on OwnerRez: ${error.response.data.messages}`,
      );
      return error.response;
    }
  }

  async updateBookingOnOwnerRez(booking: Booking): Promise<AxiosResponse> {
    try {
      const formatBooking = await this.formatBooking(booking);
      const ownerRezData = await updateBooking(
        booking.ownerRezBookingId,
        formatBooking,
      );
      if (!ownerRezData) {
        this.logger.log(`Empty response data received from the OwnerRez`);
        return;
      }
      return ownerRezData;
    } catch (error) {
      this.logger.error(
        `Error updating booking on OwnerRez: ${error.response.data.messages}`,
      );
      return error.response;
    }
  }

  private async formatBooking(booking: Booking): Promise<object> {
    const formatBooking = {
      arrival: booking.checkinDate
        ? format(booking.checkinDate, 'yyyy-MM-dd')
        : 'N/A',
      departure: booking.checkoutDate
        ? format(booking.checkoutDate, 'yyyy-MM-dd')
        : 'N/A',
      check_in: booking.checkinDate
        ? format(booking.checkinDate, 'KK:mm')
        : 'N/A',
      check_out: booking.checkoutDate
        ? format(booking.checkoutDate, 'KK:mm')
        : 'N/A',
      is_block: false,
      guest_id: 602100604,
      property_id: booking.property.ownerRezPropId | 0,
      notes: booking.notes ? booking.notes : 'None',
    };

    return formatBooking;
  }
}
