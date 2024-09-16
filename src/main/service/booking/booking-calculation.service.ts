import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyDetails } from '../../entities/property-details.entity';
import { PropertySeasonHolidays } from '../../entities/property-season-holidays.entity';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { isDateInRange, normalizeDate } from './utils/booking.util';
import { BookingRules } from 'src/main/commons/constants/enumerations/booking-rules';

interface NightsData {
  peakNights: number;
  offNights: number;
  peakHolidayNights: number;
  offHolidayNights: number;
}

@Injectable()
export class BookingCalculationService {
  constructor(
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(PropertySeasonHolidays)
    private readonly propertySeasonHolidaysRepository: Repository<PropertySeasonHolidays>,
  ) {}

  async calculateBookingDetails(
    createBookingDto: CreateBookingDTO,
  ): Promise<object> {
    const { checkinDate, checkoutDate, property, noOfPets } = createBookingDto;

    const propertyDetails = await this.propertyDetailsRepository.findOne({
      where: { property },
    });
    const propertyHolidays = await this.propertySeasonHolidaysRepository.find({
      where: { property },
      relations: ['holiday'],
    });

    const normalizedCheckinDate = normalizeDate(checkinDate);
    const normalizedCheckoutDate = normalizeDate(checkoutDate);

    const peakSeasonStart = normalizeDate(propertyDetails.peakSeasonStartDate);
    const peakSeasonEnd = normalizeDate(propertyDetails.peakSeasonEndDate);

    const nightsData: NightsData = this.calculateNights(
      normalizedCheckinDate,
      normalizedCheckoutDate,
      peakSeasonStart,
      peakSeasonEnd,
      propertyHolidays,
    );

    const isLastMinuteBooking = this.isLastMinuteBooking(normalizedCheckinDate);

    const cleaningFee = propertyDetails.cleaningFee;
    const petFee = noOfPets * propertyDetails.feePerPet;

    const checkinDateTime = new Date(normalizedCheckinDate);
    checkinDateTime.setHours(propertyDetails.checkInTime, 0, 0, 0);

    const checkoutDateTime = new Date(normalizedCheckoutDate);
    checkoutDateTime.setHours(propertyDetails.checkOutTime, 0, 0, 0);

    return {
      ...nightsData,
      isLastMinuteBooking,
      cleaningFee,
      petFee,
      checkinDate: checkinDateTime,
      checkoutDate: checkoutDateTime,
      totalNights:
        nightsData.peakNights +
        nightsData.offNights +
        nightsData.peakHolidayNights +
        nightsData.offHolidayNights,
    };
  }

  private calculateNights(
    checkinDate: Date,
    checkoutDate: Date,
    peakSeasonStart: Date,
    peakSeasonEnd: Date,
    propertyHolidays: PropertySeasonHolidays[],
  ): NightsData {
    let peakNights = 0;
    let offNights = 0;
    let peakHolidayNights = 0;
    let offHolidayNights = 0;

    const countedHolidays = new Set<number>();

    for (
      let date = new Date(checkinDate);
      date < checkoutDate;
      date.setDate(date.getDate() + 1)
    ) {
      const isHoliday = propertyHolidays.some(
        (holiday) =>
          date >= normalizeDate(holiday.holiday.startDate) &&
          date <= normalizeDate(holiday.holiday.endDate) &&
          !countedHolidays.has(holiday.holiday.id),
      );

      if (isHoliday) {
        const holiday = propertyHolidays.find(
          (h) =>
            date >= normalizeDate(h.holiday.startDate) &&
            date <= normalizeDate(h.holiday.endDate),
        );
        countedHolidays.add(holiday.holiday.id);

        if (isDateInRange(date, peakSeasonStart, peakSeasonEnd)) {
          peakHolidayNights++;
        } else {
          offHolidayNights++;
        }
      } else {
        if (isDateInRange(date, peakSeasonStart, peakSeasonEnd)) {
          peakNights++;
        } else {
          offNights++;
        }
      }
    }

    return { peakNights, offNights, peakHolidayNights, offHolidayNights };
  }

  private isLastMinuteBooking(checkinDate: Date): boolean {
    const today = new Date();
    const diffInDays =
      (checkinDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= BookingRules.LAST_MAX_DAYS;
  }
}
