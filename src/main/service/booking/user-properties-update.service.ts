import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProperties } from '../../entities/user-properties.entity';
import { Booking } from '../../entities/booking.entity';
import { updatePeakHoliday } from './utils/booking.util';

@Injectable()
export class UserPropertiesUpdateService {
  constructor(
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
  ) {}

  async updateUserProperties(booking: Booking): Promise<void> {
    const { user, property, checkinDate, checkoutDate, isLastMinuteBooking } =
      booking;
    const firstYear = checkinDate.getFullYear();
    const secondYear = checkoutDate.getFullYear();

    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: { user, property, year: firstYear },
    });

    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: { user, property, year: secondYear },
    });

    if (isLastMinuteBooking) {
      await this.updateLastMinuteBooking(
        booking,
        userPropertyFirstYear,
        userPropertySecondYear,
      );
    } else {
      await this.updateRegularBooking(
        booking,
        userPropertyFirstYear,
        userPropertySecondYear,
      );
    }

    await this.updatePeakHolidays(
      booking,
      userPropertyFirstYear.acquisitionDate,
    );
  }

  private async updateLastMinuteBooking(
    booking: Booking,
    userPropertyFirstYear: UserProperties,
    userPropertySecondYear: UserProperties,
  ): Promise<void> {
    const { checkinDate, checkoutDate } = booking;
    const firstYear = checkinDate.getFullYear();
    const secondYear = checkoutDate.getFullYear();

    const totalNightsFirstYear = this.calculateNightsInYear(
      checkinDate,
      checkoutDate,
      firstYear,
    );
    const totalNightsSecondYear = this.calculateNightsInYear(
      checkinDate,
      checkoutDate,
      secondYear,
    );

    userPropertyFirstYear.lastMinuteRemainingNights -= totalNightsFirstYear;
    userPropertyFirstYear.lastMinuteBookedNights += totalNightsFirstYear;

    if (firstYear !== secondYear) {
      userPropertySecondYear.lastMinuteRemainingNights -= totalNightsSecondYear;
      userPropertySecondYear.lastMinuteBookedNights += totalNightsSecondYear;
    }

    await this.userPropertiesRepository.save([
      userPropertyFirstYear,
      userPropertySecondYear,
    ]);
  }

  private async updateRegularBooking(
    booking: Booking,
    userPropertyFirstYear: UserProperties,
    userPropertySecondYear: UserProperties,
  ): Promise<void> {
    const { peakNights, offNights, peakHolidayNights, offHolidayNights } =
      booking;
    const firstYear = booking.checkinDate.getFullYear();
    const secondYear = booking.checkoutDate.getFullYear();

    const nightsFirstYear = this.calculateNightsInYear(
      booking.checkinDate,
      booking.checkoutDate,
      firstYear,
    );
    const nightsSecondYear = this.calculateNightsInYear(
      booking.checkinDate,
      booking.checkoutDate,
      secondYear,
    );

    const updateProperty = (property: UserProperties, nights: number) => {
      property.peakRemainingNights -=
        nights * (peakNights / (peakNights + offNights));
      property.offRemainingNights -=
        nights * (offNights / (peakNights + offNights));
      property.peakRemainingHolidayNights -=
        nights * (peakHolidayNights / (peakHolidayNights + offHolidayNights));
      property.offRemainingHolidayNights -=
        nights * (offHolidayNights / (peakHolidayNights + offHolidayNights));

      property.peakBookedNights +=
        nights * (peakNights / (peakNights + offNights));
      property.offBookedNights +=
        nights * (offNights / (peakNights + offNights));
      property.peakBookedHolidayNights +=
        nights * (peakHolidayNights / (peakHolidayNights + offHolidayNights));
      property.offBookedHolidayNights +=
        nights * (offHolidayNights / (peakHolidayNights + offHolidayNights));
    };

    updateProperty(userPropertyFirstYear, nightsFirstYear);
    if (firstYear !== secondYear) {
      updateProperty(userPropertySecondYear, nightsSecondYear);
    }

    await this.userPropertiesRepository.save([
      userPropertyFirstYear,
      userPropertySecondYear,
    ]);
  }

  private async updatePeakHolidays(
    booking: Booking,
    acquisitionDate: Date,
  ): Promise<void> {
    const { user, property, checkinDate, checkoutDate, peakHolidayNights } =
      booking;

    if (peakHolidayNights > 0) {
      const holidayYear = checkinDate.getFullYear();
      await updatePeakHoliday(
        holidayYear,
        peakHolidayNights,
        this.userPropertiesRepository,
        acquisitionDate,
        user,
        property,
      );
    }

    if (
      checkinDate.getFullYear() !== checkoutDate.getFullYear() &&
      peakHolidayNights > 0
    ) {
      const holidayYear = checkoutDate.getFullYear();
      await updatePeakHoliday(
        holidayYear,
        peakHolidayNights,
        this.userPropertiesRepository,
        acquisitionDate,
        user,
        property,
      );
    }
  }

  private calculateNightsInYear(
    checkinDate: Date,
    checkoutDate: Date,
    year: number,
  ): number {
    const startDate = new Date(
      Math.max(checkinDate.getTime(), new Date(year, 0, 1).getTime()),
    );
    const endDate = new Date(
      Math.min(checkoutDate.getTime(), new Date(year, 11, 31).getTime()),
    );
    return Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }
}
