import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { BookingHistory } from 'entities/booking-history.entity';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertySeasonHolidays } from 'entities/property-season-holidays.entity';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { BookingRules } from 'src/main/commons/constants/enumerations/booking-rules';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { NightCounts } from '../interface/bookingInterface';
import { isDateInRange, normalizeDate } from './date.util';

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

    for (
      let date = new Date(checkinDate);
      date < checkoutDate;
      date.setDate(date.getDate() + 1)
    ) {
      const currentYear = date.getFullYear();
      const adjustedYear =
        date.getMonth() === 11 && date.getDate() === 31
          ? currentYear + 1
          : currentYear;

      PropertyHolidays.forEach((PropertyHoliday) => {
        if (
          date >= normalizeDate(PropertyHoliday.holiday.startDate) &&
          date <= normalizeDate(PropertyHoliday.holiday.endDate)
        ) {
          if (!countedHolidays.has(PropertyHoliday.holiday.id)) {
            countedHolidays.add(PropertyHoliday.holiday.id);
            if (isDateInRange(date, peakSeasonStart, peakSeasonEnd)) {
              if (adjustedYear === checkinDate.getFullYear()) {
                peakHolidayNightsInFirstYear++;
              } else {
                peakHolidayNightsInSecondYear++;
              }
            } else {
              if (adjustedYear === checkinDate.getFullYear()) {
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
          if (adjustedYear === checkinDate.getFullYear()) {
            peakNightsInFirstYear++;
          } else {
            peakNightsInSecondYear++;
          }
        } else {
          if (adjustedYear === checkinDate.getFullYear()) {
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

  isLastMinuteBooking(checkinDate: Date | string): boolean {
    const date = new Date(checkinDate);
    const today = new Date();
    const diffInDays =
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= BookingRules.LAST_MAX_DAYS;
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
          nightCounts.peakNightsInFirstYear + nightCounts.offNightsInFirstYear;
        userPropertyFirstYear.lastMinuteRemainingNights -= totalNightsFirstYear;
        userPropertyFirstYear.lastMinuteBookedNights += totalNightsFirstYear;
      } else {
        this.updateNightCounts(userPropertyFirstYear, nightCounts, 'FirstYear');
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
        this.updateNightCounts(
          userPropertySecondYear,
          nightCounts,
          'SecondYear',
        );
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
    yearType: 'FirstYear' | 'SecondYear',
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

  async updatePeakHoliday(
    year: number,
    nights: number,
    user: User,
    property: Property,
  ): Promise<void> {
    const userProperty = await this.userPropertiesRepository.findOne({
      where: { user: { id: user.id }, property: { id: property.id }, year },
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
}
