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
import {
  normalizeDate,
  isDateInRange,
  generateBookingId,
  updatePeakHoliday,
} from 'src/main/service/booking/utils/booking.util';
import { Property } from 'src/main/entities/property.entity';

@Injectable()
export class CreateBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
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
      user,
    } = createBookingDto;

    const property = await this.propertyRepository.findOne({
      where: { id: createBookingDto.property.id },
    });

    const today = new Date();
    const checkinDate = normalizeDate(checkinDateStr);
    const checkoutDate = normalizeDate(checkoutDateStr);

    if (checkinDate < normalizeDate(today)) {
      return BOOKING_RESPONSES.CHECKIN_DATE_PAST;
    }

    if (checkinDate >= checkoutDate) {
      return BOOKING_RESPONSES.CHECKOUT_BEFORE_CHECKIN;
    }

    const checkInEndDate = normalizeDate(
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

    const checkinDateTime = new Date(checkinDate);
    checkinDateTime.setHours(propertyDetails.checkInTime, 0, 0, 0);

    const checkoutDateTime = new Date(checkoutDate);
    checkoutDateTime.setHours(propertyDetails.checkOutTime, 0, 0, 0);

    const timeDifference = checkinDateTime.getTime() - today.getTime();
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
          date >= normalizeDate(booking.checkinDate) &&
          date < normalizeDate(booking.checkoutDate),
      );

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
              if (adjustedYear === checkinYear) {
                peakHolidayNightsInFirstYear++;
              } else {
                peakHolidayNightsInSecondYear++;
              }
            } else {
              if (adjustedYear === checkinYear) {
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
          if (adjustedYear === checkinYear) {
            peakNightsInFirstYear++;
          } else {
            peakNightsInSecondYear++;
          }
        } else {
          if (adjustedYear === checkinYear) {
            offNightsInFirstYear++;
          } else {
            offNightsInSecondYear++;
          }
        }
      }
    }

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
      if (nightsSelected > userProperty.lastMinuteRemainingNights) {
        return BOOKING_RESPONSES.INSUFFICIENT_LAST_MIN_BOOKING_NIGHTS;
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

      const isValidCrossYearHoliday = await this.validatePeakSeasonHolidays(
        user,
        property,
        checkinDate,
        peakHolidayNightsInFirstYear,
        peakHolidayNightsInSecondYear,
      );

      if (!isValidCrossYearHoliday) {
        return BOOKING_RESPONSES.INSUFFICIENT_PEAK_HOLIDAY_NIGHTS;
      }

      if (
        offHolidayNightsInFirstYear + offHolidayNightsInSecondYear >
        userProperty.offRemainingHolidayNights
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_OFF_HOLIDAY_NIGHTS;
      }
    }

    const booking = this.bookingRepository.create(createBookingDto);

    booking.bookingId = await generateBookingId(
      this.bookingRepository,
      property.id,
    );
    booking.cleaningFee = propertyDetails.cleaningFee;
    booking.petFee = createBookingDto.noOfPets * propertyDetails.feePerPet;
    booking.isLastMinuteBooking = isLastMinuteBooking;
    booking.totalNights = nightsSelected;
    booking.checkinDate = checkinDateTime;
    booking.checkoutDate = checkoutDateTime;
    const savedBooking = await this.bookingRepository.save(booking);

    await this.updateUserProperties(
      user,
      property,
      checkinYear,
      checkoutYear,
      checkinDate,
      checkoutDate,
      userProperty.acquisitionDate,

      {
        peakNightsInFirstYear,
        offNightsInFirstYear,
        peakHolidayNightsInFirstYear,
        offHolidayNightsInFirstYear,
        peakNightsInSecondYear,
        offNightsInSecondYear,
        peakHolidayNightsInSecondYear,
        offHolidayNightsInSecondYear,
      },
      isLastMinuteBooking,
    );
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

  async updateUserProperties(
    user: User,
    property: Property,
    firstYear: number,
    secondYear: number,
    checkinDate: Date,
    checkoutDate: Date,
    acquisitionDate: Date,
    nights: {
      peakNightsInFirstYear: number;
      offNightsInFirstYear: number;
      peakHolidayNightsInFirstYear: number;
      offHolidayNightsInFirstYear: number;
      peakNightsInSecondYear: number;
      offNightsInSecondYear: number;
      peakHolidayNightsInSecondYear: number;
      offHolidayNightsInSecondYear: number;
    },
    isLastMinuteBooking: boolean,
  ): Promise<void> {
    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: { user, property, year: firstYear },
    });

    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: { user, property, year: secondYear },
    });

    if (userPropertyFirstYear) {
      if (isLastMinuteBooking) {
        const totalNightsFirstYear =
          nights.peakNightsInFirstYear + nights.offNightsInFirstYear;
        userPropertyFirstYear.lastMinuteRemainingNights -= totalNightsFirstYear;
        userPropertyFirstYear.lastMinuteBookedNights += totalNightsFirstYear;

        await this.userPropertiesRepository.save(userPropertyFirstYear);
      } else {
        userPropertyFirstYear.peakRemainingNights -=
          nights.peakNightsInFirstYear;
        userPropertyFirstYear.offRemainingNights -= nights.offNightsInFirstYear;
        userPropertyFirstYear.peakRemainingHolidayNights -=
          nights.peakHolidayNightsInFirstYear;
        userPropertyFirstYear.offRemainingHolidayNights -=
          nights.offHolidayNightsInFirstYear;

        userPropertyFirstYear.peakBookedNights += nights.peakNightsInFirstYear;
        userPropertyFirstYear.offBookedNights += nights.offNightsInFirstYear;
        userPropertyFirstYear.peakBookedHolidayNights +=
          nights.peakHolidayNightsInFirstYear;
        userPropertyFirstYear.offBookedHolidayNights +=
          nights.offHolidayNightsInFirstYear;

        await this.userPropertiesRepository.save(userPropertyFirstYear);
      }
    }

    if (userPropertySecondYear && firstYear != secondYear) {
      if (isLastMinuteBooking) {
        const totalNightsSecondYear =
          nights.peakNightsInSecondYear + nights.offNightsInSecondYear;
        userPropertySecondYear.lastMinuteRemainingNights -=
          totalNightsSecondYear;
        userPropertySecondYear.lastMinuteBookedNights += totalNightsSecondYear;

        await this.userPropertiesRepository.save(userPropertySecondYear);
      } else {
        userPropertySecondYear.peakRemainingNights -=
          nights.peakNightsInSecondYear;
        userPropertySecondYear.offRemainingNights -=
          nights.offNightsInSecondYear;
        userPropertySecondYear.peakRemainingHolidayNights -=
          nights.peakHolidayNightsInSecondYear;
        userPropertySecondYear.offRemainingHolidayNights -=
          nights.offHolidayNightsInSecondYear;

        userPropertySecondYear.peakBookedNights +=
          nights.peakNightsInSecondYear;
        userPropertySecondYear.offBookedNights += nights.offNightsInSecondYear;
        userPropertySecondYear.peakBookedHolidayNights +=
          nights.peakHolidayNightsInSecondYear;
        userPropertySecondYear.offBookedHolidayNights +=
          nights.offHolidayNightsInSecondYear;

        await this.userPropertiesRepository.save(userPropertySecondYear);
      }
    }
    if (nights.peakHolidayNightsInFirstYear > 0) {
      const holidayYear = checkinDate.getFullYear();
      await updatePeakHoliday(
        holidayYear,
        nights.peakHolidayNightsInFirstYear,
        this.userPropertiesRepository,
        acquisitionDate,
        user,
        property,
      );
    }
    if (nights.peakHolidayNightsInSecondYear > 0) {
      const holidayYear = checkoutDate.getFullYear();
      await updatePeakHoliday(
        holidayYear,
        nights.peakHolidayNightsInSecondYear,
        this.userPropertiesRepository,
        acquisitionDate,
        user,
        property,
      );
    }
  }
  async validatePeakSeasonHolidays(
    user: User,
    property: Property,
    checkinDate: Date,
    peakHolidayNightsInFirstYear: number,
    peakHolidayNightsInSecondYear: number,
  ): Promise<boolean> {
    const firstYear = checkinDate.getFullYear();

    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: { user, property, year: firstYear },
    });

    if (!userPropertyFirstYear) {
      return false;
    }

    const remainingNights = userPropertyFirstYear.peakRemainingHolidayNights;

    if (
      peakHolidayNightsInFirstYear + peakHolidayNightsInSecondYear <=
      remainingNights
    ) {
      return true;
    }
    return false;
  }
}
