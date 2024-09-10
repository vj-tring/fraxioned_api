import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { BookingHistory } from 'entities/booking-history.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { CreateBookingDTO } from '../../dto/requests/booking/create-booking.dto';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertySeasonHolidays } from 'entities/property-season-holidays.entity';
import { PropertyDetails } from '../../entities/property-details.entity';
import { BookingRules } from '../../commons/constants/enumerations/booking-rules';
import {
  mailSubject,
  mailTemplates,
} from 'src/main/commons/constants/email/mail.constants';
import { MailService } from 'src/main/email/mail.service';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import { format } from 'date-fns';
import { Property } from 'src/main/entities/property.entity';

@Injectable()
export class CreateBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(UserProperties)
    private readonly userPropertiesRepository: Repository<UserProperties>,
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(PropertySeasonHolidays)
    private readonly propertySeasonHolidaysRepository: Repository<PropertySeasonHolidays>,
    @InjectRepository(BookingHistory)
    private readonly bookingHistoryRepository: Repository<BookingHistory>,
    @InjectRepository(UserContactDetails)
    private readonly userContactDetailsRepository: Repository<UserContactDetails>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
    private readonly mailService: MailService,
  ) {}

  async createBooking(createBookingDto: CreateBookingDTO): Promise<object> {
    this.logger.log('Creating a new booking');

    const {
      checkinDate: checkinDateStr,
      checkoutDate: checkoutDateStr,
      property,
      user,
    } = createBookingDto;

    const today = new Date();
    const checkinDate = this.normalizeDate(checkinDateStr);
    const checkoutDate = this.normalizeDate(checkoutDateStr);

    if (checkinDate < this.normalizeDate(today)) {
      return BOOKING_RESPONSES.CHECKIN_DATE_PAST;
    }

    if (checkinDate >= checkoutDate) {
      return BOOKING_RESPONSES.CHECKOUT_BEFORE_CHECKIN;
    }

    const checkInEndDate = this.normalizeDate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 730),
    );

    const isLeapYear = (year: number): boolean => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    const daysInYear = isLeapYear(today.getFullYear()) ? 366 : 365;
    const daysInNextYear = isLeapYear(today.getFullYear() + 1) ? 366 : 365;

    if (daysInYear === 366 || daysInNextYear === 366) {
      checkInEndDate.setDate(checkInEndDate.getDate() + 1);
    }

    if (checkinDate > checkInEndDate) {
      return BOOKING_RESPONSES.DATES_OUT_OF_RANGE;
    }

    const propertyDetails = await this.propertyDetailsRepository.findOne({
      where: { property: property },
    });

    if (!propertyDetails) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    const checkinTime = new Date(checkinDate);
    checkinTime.setHours(propertyDetails.checkInTime, 0, 0, 0);

    const timeDifference = checkinTime.getTime() - today.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return BOOKING_RESPONSES.BOOKING_TOO_CLOSE_TO_CHECKIN;
    }

    const bookingYear = checkinDate.getFullYear();
    if (isNaN(bookingYear)) {
      this.logger.error('Invalid booking year');
      return BOOKING_RESPONSES.INVALID_BOOKING_YEAR;
    }

    const userProperty = await this.userPropertiesRepository.findOne({
      where: { user: user, property: property, year: bookingYear },
    });

    if (!userProperty) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    if (
      createBookingDto.noOfGuests > propertyDetails.noOfGuestsAllowed ||
      createBookingDto.noOfPets > propertyDetails.noOfPetsAllowed
    ) {
      return BOOKING_RESPONSES.GUESTS_LIMIT_EXCEEDS;
    }

    const lastBookings = await this.bookingRepository.find({
      where: {
        user: user,
        property: property,
        checkoutDate: MoreThanOrEqual(today),
      },
      order: { checkoutDate: 'DESC' },
    });

    for (const booking of lastBookings) {
      const lastCheckoutDate = this.normalizeDate(
        new Date(booking.checkoutDate),
      );
      const lastCheckinDate = this.normalizeDate(new Date(booking.checkinDate));
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

    const bookedDates = await this.bookingRepository.find({
      where: { property: property },
      select: ['checkinDate', 'checkoutDate'],
    });

    const PropertyHolidays = await this.propertySeasonHolidaysRepository.find({
      where: { property: property },
      relations: ['holiday'],
    });

    const isBookedDate = (date: Date): boolean =>
      bookedDates.some(
        (booking) =>
          date >= this.normalizeDate(booking.checkinDate) &&
          date <= this.normalizeDate(booking.checkoutDate),
      );

    const peakSeasonStart = this.normalizeDate(
      new Date(propertyDetails.peakSeasonStartDate),
    );
    const peakSeasonEnd = this.normalizeDate(
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

    const checkinYear = checkinDate.getFullYear();
    const checkoutYear = checkoutDate.getFullYear();

    const countedHolidays = new Set<number>();

    for (
      let date = new Date(checkinDate);
      date < checkoutDate;
      date.setDate(date.getDate() + 1)
    ) {
      if (isBookedDate(date)) {
        return BOOKING_RESPONSES.DATES_BOOKED_OR_UNAVAILABLE;
      }
      const currentYear = date.getFullYear();

      PropertyHolidays.forEach((PropertyHoliday) => {
        if (
          date >= this.normalizeDate(PropertyHoliday.holiday.startDate) &&
          date <= this.normalizeDate(PropertyHoliday.holiday.endDate)
        ) {
          if (!countedHolidays.has(PropertyHoliday.holiday.id)) {
            countedHolidays.add(PropertyHoliday.holiday.id);
            if (this.isDateInRange(date, peakSeasonStart, peakSeasonEnd)) {
              if (currentYear === checkinYear) {
                peakHolidayNightsInFirstYear++;
              } else {
                peakHolidayNightsInSecondYear++;
              }
            } else {
              if (currentYear === checkinYear) {
                offHolidayNightsInFirstYear++;
              } else {
                offHolidayNightsInSecondYear++;
              }
            }
          }
        }
      });

      if (!countedHolidays.has(date.getTime())) {
        if (this.isDateInRange(date, peakSeasonStart, peakSeasonEnd)) {
          if (currentYear === checkinYear) {
            peakNightsInFirstYear++;
          } else {
            peakNightsInSecondYear++;
          }
        } else {
          if (currentYear === checkinYear) {
            offNightsInFirstYear++;
          } else {
            offNightsInSecondYear++;
          }
        }
      }
    }

    const nightsInFirstYear = peakNightsInFirstYear + offNightsInFirstYear;
    const nightsInSecondYear = peakNightsInSecondYear + offNightsInSecondYear;

    const diffInDays =
      (checkinDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    const isLastMinuteBooking = diffInDays <= BookingRules.LAST_MAX_DAYS;

    const nightsSelected =
      (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24);

    if (isLastMinuteBooking) {
      if (nightsSelected < BookingRules.LAST_MIN_NIGHTS) {
        return BOOKING_RESPONSES.LAST_MINUTE_MIN_NIGHTS(
          BookingRules.LAST_MIN_NIGHTS,
        );
      }
      if (nightsSelected > BookingRules.LAST_MAX_NIGHTS) {
        return BOOKING_RESPONSES.LAST_MINUTE_MAX_NIGHTS(
          BookingRules.LAST_MAX_NIGHTS,
        );
      }
    } else {
      if (nightsSelected < BookingRules.REGULAR_MIN_NIGHTS) {
        return BOOKING_RESPONSES.REGULAR_MIN_NIGHTS(
          BookingRules.REGULAR_MIN_NIGHTS,
        );
      }
      if (nightsSelected > userProperty.maximumStayLength) {
        return BOOKING_RESPONSES.MAX_STAY_LENGTH_EXCEEDED;
      }
    }

    if (
      peakNightsInFirstYear + peakHolidayNightsInSecondYear >
      userProperty.peakRemainingNights
    ) {
      return BOOKING_RESPONSES.INSUFFICIENT_PEAK_NIGHTS;
    }

    if (
      offNightsInFirstYear + offNightsInSecondYear >
      userProperty.offRemainingNights
    ) {
      return BOOKING_RESPONSES.INSUFFICIENT_OFF_NIGHTS;
    }

    if (
      peakHolidayNightsInFirstYear + peakHolidayNightsInSecondYear >
      userProperty.peakRemainingHolidayNights
    ) {
      return BOOKING_RESPONSES.INSUFFICIENT_PEAK_HOLIDAY_NIGHTS;
    }

    if (
      offHolidayNightsInFirstYear + offHolidayNightsInSecondYear >
      userProperty.offRemainingHolidayNights
    ) {
      return BOOKING_RESPONSES.INSUFFICIENT_OFF_HOLIDAY_NIGHTS;
    }

    const booking = this.bookingRepository.create(createBookingDto);

    booking.bookingId = await this.generateBookingId(property.id);
    booking.cleaningFee = propertyDetails.cleaningFee;
    booking.petFee = createBookingDto.noOfPets * propertyDetails.feePerPet;
    booking.isLastMinuteBooking = isLastMinuteBooking;
    const savedBooking = await this.bookingRepository.save(booking);

    userProperty.peakRemainingNights -= peakNightsInFirstYear;
    userProperty.offRemainingNights -= offNightsInFirstYear;
    userProperty.peakRemainingHolidayNights -= peakHolidayNightsInFirstYear;
    userProperty.offRemainingHolidayNights -= offHolidayNightsInFirstYear;

    userProperty.peakBookedNights += peakNightsInFirstYear;
    userProperty.offBookedNights += offNightsInFirstYear;
    userProperty.peakBookedHolidayNights += peakHolidayNightsInFirstYear;
    userProperty.offBookedHolidayNights += offHolidayNightsInFirstYear;

    if (isLastMinuteBooking) {
      userProperty.lastMinuteRemainingNights -= nightsInFirstYear;
      userProperty.lastMinuteBookedNights += nightsInFirstYear;
    }

    await this.userPropertiesRepository.save(userProperty);

    if (nightsInSecondYear > 0) {
      const userPropertyNextYear = await this.userPropertiesRepository.findOne({
        where: { user: user, property: property, year: checkoutYear },
      });

      if (userPropertyNextYear) {
        userPropertyNextYear.peakRemainingNights -= peakNightsInSecondYear;
        userPropertyNextYear.offRemainingNights -= offNightsInSecondYear;
        userPropertyNextYear.peakRemainingHolidayNights -=
          peakHolidayNightsInSecondYear;
        userPropertyNextYear.offRemainingHolidayNights -=
          offHolidayNightsInSecondYear;

        userPropertyNextYear.peakBookedNights += peakNightsInSecondYear;
        userPropertyNextYear.offBookedNights += offNightsInSecondYear;
        userPropertyNextYear.peakBookedHolidayNights +=
          peakHolidayNightsInSecondYear;
        userPropertyNextYear.offBookedHolidayNights +=
          offHolidayNightsInSecondYear;

        if (isLastMinuteBooking) {
          userPropertyNextYear.lastMinuteRemainingNights -= nightsInSecondYear;
          userPropertyNextYear.lastMinuteBookedNights += nightsInSecondYear;
        }

        await this.userPropertiesRepository.save(userPropertyNextYear);
      }
      if (peakHolidayNightsInSecondYear > 0) {
        await this.validatePeakSeasonHoliday(
          user,
          property,
          checkinDate,
          userProperty.acquisitionDate,
          today,
          peakHolidayNightsInSecondYear,
        );
      }
    }

    const owner = await this.userRepository.findOne({
      where: {
        id: savedBooking.user.id,
      },
    });

    const contact = await this.userContactDetailsRepository.find({
      where: {
        user: {
          id: savedBooking.user.id,
        },
      },
      select: ['primaryEmail'],
    });

    const { primaryEmail: email } = contact[0];
    const subject = mailSubject.booking.confirmation;
    const template = mailTemplates.booking.confirmation;
    const context = {
      ownerName: `${owner.firstName} ${owner.lastName}`,
      propertyName: savedBooking.property.propertyName,
      bookingId: savedBooking.bookingId,
      checkIn: format(savedBooking.checkinDate, 'MM/dd/yyyy @ KK:mm aa'),
      checkOut: format(savedBooking.checkoutDate, 'MM/dd/yyyy @ KK:mm aa'),
      adults: savedBooking.noOfAdults,
      children: savedBooking.noOfChildren,
      pets: savedBooking.noOfPets,
      notes: savedBooking.notes,
    };

    await this.mailService.sendMail(email, subject, template, context);

    this.logger.log(
      `Booking confirmation mail has been sent to mail : ${email}`,
    );

    const bookingHistory = this.bookingHistoryRepository.create({
      ...booking,
    });
    (bookingHistory.modifiedBy = createBookingDto.createdBy),
      (bookingHistory.userAction = 'Created'),
      await this.bookingHistoryRepository.save(bookingHistory);

    return BOOKING_RESPONSES.BOOKING_CREATED(booking);
  }

  private normalizeDate(date: Date | string): Date {
    const parsedDate = new Date(date);
    return new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
    );
  }

  private extractMonthDay(date: Date): { month: number; day: number } {
    return { month: date.getMonth(), day: date.getDate() };
  }

  private isDateInRange(date: Date, start: Date, end: Date): boolean {
    const { month: dateMonth, day: dateDay } = this.extractMonthDay(date);
    const { month: startMonth, day: startDay } = this.extractMonthDay(start);
    const { month: endMonth, day: endDay } = this.extractMonthDay(end);

    if (
      startMonth < endMonth ||
      (startMonth === endMonth && startDay <= endDay)
    ) {
      return (
        (dateMonth > startMonth ||
          (dateMonth === startMonth && dateDay >= startDay)) &&
        (dateMonth < endMonth || (dateMonth === endMonth && dateDay <= endDay))
      );
    } else {
      return (
        dateMonth > startMonth ||
        (dateMonth === startMonth && dateDay >= startDay) ||
        dateMonth < endMonth ||
        (dateMonth === endMonth && dateDay <= endDay)
      );
    }
  }
  private async generateBookingId(propertyId: number): Promise<string> {
    const baseStartNumber = 1;

    const propertyIdLength = Math.max(2, propertyId.toString().length);

    const lastBooking = await this.bookingRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
      select: ['bookingId'],
    });

    const lastId = lastBooking
      ? parseInt(lastBooking.bookingId.slice(6 + propertyIdLength), 10)
      : baseStartNumber - 1;

    const newId = lastId + 1;
    const incrementingNumberLength = Math.max(2, newId.toString().length);

    const currentYear = new Date().getFullYear().toString();

    const paddedPropertyId = propertyId
      .toString()
      .padStart(propertyIdLength, '0');
    const paddedNewId = newId
      .toString()
      .padStart(incrementingNumberLength, '0');

    return `FX${currentYear}${paddedPropertyId}${paddedNewId}`;
  }

  async validatePeakSeasonHoliday(
    user: User,
    property: Property,
    checkinDate: Date,
    acquisitionDate: Date,
    today: Date,
    peakHolidayNights: number,
  ): Promise<void> {
    if (peakHolidayNights > 0) {
      const checkInYear = checkinDate.getFullYear();
      const acquisitionYear = acquisitionDate.getFullYear();
      const currentYearForValidation = today.getFullYear();
      const diffOfAcquisitionAndCheckInYear = checkInYear - acquisitionYear + 1;
      const isEven = diffOfAcquisitionAndCheckInYear % 2 === 0;

      let targetYear: number, userPropertyToUpdate: UserProperties;

      if (
        !isEven &&
        (currentYearForValidation === checkInYear ||
          currentYearForValidation + 1 === checkInYear)
      ) {
        targetYear = checkInYear + 1;
      } else if (
        isEven &&
        (currentYearForValidation + 1 === checkInYear ||
          currentYearForValidation + 2 === checkInYear)
      ) {
        targetYear = checkInYear - 1;
      }

      if (targetYear) {
        userPropertyToUpdate = await this.userPropertiesRepository.findOne({
          where: { user: user, property: property, year: targetYear },
        });

        if (userPropertyToUpdate) {
          userPropertyToUpdate.peakRemainingHolidayNights -= peakHolidayNights;
          userPropertyToUpdate.peakBookedHolidayNights += peakHolidayNights;
          await this.userPropertiesRepository.save(userPropertyToUpdate);
        }
      }
    }
  }
}
