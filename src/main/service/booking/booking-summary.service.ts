import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { CreateBookingDTO } from '../../dto/requests/booking/create-booking.dto';
import { PropertySeasonHolidays } from 'entities/property-season-holidays.entity';
import { PropertyDetails } from '../../entities/property-details.entity';
import { Property } from 'src/main/entities/property.entity';
import { BookingUtilService } from 'src/main/service/booking/utils/booking.service.util';
import { NightCounts } from './interface/bookingInterface';
import { normalizeDates } from './utils/date.util';
import { generateBookingId } from './utils/booking-id.util';
import { BookingValidationService } from './utils/validation.util';

@Injectable()
export class BookingSummaryService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(PropertySeasonHolidays)
    private readonly propertySeasonHolidaysRepository: Repository<PropertySeasonHolidays>,
    private readonly logger: LoggerService,
    private readonly bookingUtilService: BookingUtilService,
    private readonly bookingValidationService: BookingValidationService,
  ) {}

  async bookingSummary(createBookingDto: CreateBookingDTO): Promise<object> {
    this.logger.log('Creating a booking summary');

    const {
      checkinDate: checkinDateStr,
      checkoutDate: checkoutDateStr,
      user,
    } = createBookingDto;

    const property = await this.bookingUtilService.getProperty(
      createBookingDto.property.id,
    );
    const propertyDetails =
      await this.bookingUtilService.getPropertyDetails(property);

    if (!propertyDetails) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    const { checkinDate, checkoutDate } = normalizeDates(
      checkinDateStr,
      checkoutDateStr,
    );

    const dateValidationResult = this.bookingValidationService.validateDates(
      checkinDate,
      checkoutDate,
      propertyDetails,
    );
    if (dateValidationResult !== true) {
      return dateValidationResult;
    }

    const userPropertyValidationResult =
      await this.bookingValidationService.validateUserProperty(
        user,
        property,
        checkinDate,
        checkoutDate,
      );
    if (userPropertyValidationResult !== true) {
      return userPropertyValidationResult;
    }

    const guestValidationResult =
      this.bookingValidationService.validateGuestLimits(
        createBookingDto,
        propertyDetails,
      );
    if (guestValidationResult !== true) {
      return guestValidationResult;
    }

    const bookingGapValidationResult =
      await this.bookingValidationService.validateBookingGap(
        user,
        property,
        checkinDate,
        checkoutDate,
      );
    if (bookingGapValidationResult !== true) {
      return bookingGapValidationResult;
    }

    const bookedDatesValidationResult =
      await this.bookingValidationService.validateBookedDates(
        property,
        checkinDate,
        checkoutDate,
      );
    if (bookedDatesValidationResult !== true) {
      return bookedDatesValidationResult;
    }

    const nightCounts: NightCounts =
      await this.bookingUtilService.calculateNightCounts(
        property,
        checkinDate,
        checkoutDate,
        propertyDetails,
      );

    const isLastMinuteBooking =
      this.bookingUtilService.isLastMinuteBooking(checkinDate);
    const nightsSelected = this.bookingUtilService.calculateNightsSelected(
      checkinDate,
      checkoutDate,
    );

    const bookingRulesValidationResult =
      await this.bookingValidationService.validateBookingRules(
        isLastMinuteBooking,
        nightsSelected,
        nightCounts,
        user,
        property,
        checkinDate,
      );
    if (bookingRulesValidationResult !== true) {
      return bookingRulesValidationResult;
    }

    const totalAmountDue =
      propertyDetails.cleaningFee +
      createBookingDto.noOfPets * propertyDetails.feePerPet;
    const dateOfCharge = new Date();

    const bookingSummary = {
      propertyId: property.id,
      propertyName: property.propertyName,
      checkIn: new Date(
        checkinDate.setHours(propertyDetails.checkInTime, 0, 0, 0),
      ),
      checkOut: new Date(
        checkoutDate.setHours(propertyDetails.checkOutTime, 0, 0, 0),
      ),
      totalNights: nightsSelected,
      noOfGuests: createBookingDto.noOfGuests,
      adults: createBookingDto.noOfAdults,
      children: createBookingDto.noOfChildren,
      pets: createBookingDto.noOfPets,
      season: this.getSeason(checkinDate, propertyDetails),
      holiday: await this.isHoliday(checkinDate, property),
      totalAmountDue,
      dateOfCharge,
      bookingId: await generateBookingId(this.bookingRepository, property.id),
      cleaningFee: propertyDetails.cleaningFee,
      petFee: createBookingDto.noOfPets * propertyDetails.feePerPet,
      isLastMinuteBooking,
      peakNights:
        nightCounts.peakNightsInFirstYear + nightCounts.peakNightsInSecondYear,
      offNights:
        nightCounts.offNightsInFirstYear + nightCounts.offNightsInSecondYear,
      peakHolidayNights:
        nightCounts.peakHolidayNightsInFirstYear +
        nightCounts.peakHolidayNightsInSecondYear,
      offHolidayNights:
        nightCounts.offHolidayNightsInFirstYear +
        nightCounts.offHolidayNightsInSecondYear,
      checkInTime: propertyDetails.checkInTime,
      checkOutTime: propertyDetails.checkOutTime,
    };

    return bookingSummary;
  }

  private getSeason(date: Date, propertyDetails: PropertyDetails): string {
    const peakSeasonStart = new Date(propertyDetails.peakSeasonStartDate);
    const peakSeasonEnd = new Date(propertyDetails.peakSeasonEndDate);
    return date >= peakSeasonStart && date <= peakSeasonEnd ? 'Peak' : 'Off';
  }

  private async isHoliday(date: Date, property: Property): Promise<string> {
    const propertyHolidays = await this.propertySeasonHolidaysRepository.find({
      where: { property: property },
      relations: ['holiday'],
    });

    const isHolidayDate = propertyHolidays.some(
      (holiday) =>
        date >= new Date(holiday.holiday.startDate) &&
        date <= new Date(holiday.holiday.endDate),
    );

    return isHolidayDate ? 'Holiday' : 'Regular';
  }
}
