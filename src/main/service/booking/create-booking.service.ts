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
import { SpaceTypes } from 'src/main/entities/space-types.entity';
import { PropertyImages } from 'src/main/entities/property_images.entity';
import { authConstants } from 'src/main/commons/constants/authentication/authentication.constants';
import { NightCounts } from './interface/bookingInterface';

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
    @InjectRepository(SpaceTypes)
    private readonly spaceTypesRepository: Repository<SpaceTypes>,
    @InjectRepository(PropertyImages)
    private readonly propertyImagesRepository: Repository<PropertyImages>,
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

    const property = await this.getProperty(createBookingDto.property.id);
    const propertyDetails = await this.getPropertyDetails(property);

    if (!propertyDetails) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    const { checkinDate, checkoutDate } = this.normalizeDates(
      checkinDateStr,
      checkoutDateStr,
    );

    const dateValidationResult = this.validateDates(
      checkinDate,
      checkoutDate,
      propertyDetails,
    );
    if (dateValidationResult !== true) {
      return dateValidationResult;
    }

    const userPropertyValidationResult = await this.validateUserProperty(
      user,
      property,
      checkinDate,
      checkoutDate,
    );
    if (userPropertyValidationResult !== true) {
      return userPropertyValidationResult;
    }

    const guestValidationResult = this.validateGuestLimits(
      createBookingDto,
      propertyDetails,
    );
    if (guestValidationResult !== true) {
      return guestValidationResult;
    }

    const bookingGapValidationResult = await this.validateBookingGap(
      user,
      property,
      checkinDate,
      checkoutDate,
    );
    if (bookingGapValidationResult !== true) {
      return bookingGapValidationResult;
    }

    const bookedDatesValidationResult = await this.validateBookedDates(
      property,
      checkinDate,
      checkoutDate,
    );
    if (bookedDatesValidationResult !== true) {
      return bookedDatesValidationResult;
    }

    const nightCounts = await this.calculateNightCounts(
      property,
      checkinDate,
      checkoutDate,
      propertyDetails,
    );

    const isLastMinuteBooking = this.isLastMinuteBooking(checkinDate);
    const nightsSelected = this.calculateNightsSelected(
      checkinDate,
      checkoutDate,
    );

    const bookingValidationResult = await this.validateBookingRules(
      isLastMinuteBooking,
      nightsSelected,
      nightCounts,
      user,
      property,
      checkinDate,
    );
    if (bookingValidationResult !== true) {
      return bookingValidationResult;
    }

    const savedBooking = await this.saveBooking(
      createBookingDto,
      property,
      propertyDetails,
      isLastMinuteBooking,
      nightsSelected,
    );

    await this.updateUserProperties(
      user,
      property,
      checkinDate,
      checkoutDate,
      nightCounts,
      isLastMinuteBooking,
    );

    await this.sendBookingConfirmationEmail(savedBooking);

    const userAction = 'Created';
    await this.createBookingHistory(
      savedBooking,
      createBookingDto.createdBy,
      userAction,
    );

    return BOOKING_RESPONSES.BOOKING_CREATED(savedBooking);
  }

  async getProperty(propertyId: number): Promise<Property> {
    return this.propertyRepository.findOne({ where: { id: propertyId } });
  }

  async getPropertyDetails(property: Property): Promise<PropertyDetails> {
    return this.propertyDetailsRepository.findOne({
      where: { property: property },
    });
  }

  normalizeDates(
    checkinDateStr: Date,
    checkoutDateStr: Date,
  ): { checkinDate: Date; checkoutDate: Date } {
    const checkinDate = normalizeDate(checkinDateStr);
    const checkoutDate = normalizeDate(checkoutDateStr);
    return { checkinDate, checkoutDate };
  }

  validateDates(
    checkinDate: Date,
    checkoutDate: Date,
    propertyDetails: PropertyDetails,
  ): true | object {
    const today = new Date();

    if (checkinDate < normalizeDate(today)) {
      return BOOKING_RESPONSES.CHECKIN_DATE_PAST;
    }

    if (checkinDate >= checkoutDate) {
      return BOOKING_RESPONSES.CHECKOUT_BEFORE_CHECKIN;
    }

    const checkInEndDate = new Date(today);
    checkInEndDate.setFullYear(today.getFullYear() + 2);

    if (checkinDate > checkInEndDate) {
      return BOOKING_RESPONSES.DATES_OUT_OF_RANGE;
    }

    const checkinDateTime = new Date(checkinDate);
    checkinDateTime.setHours(propertyDetails.checkInTime, 0, 0, 0);

    const timeDifference = checkinDateTime.getTime() - today.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return BOOKING_RESPONSES.BOOKING_TOO_CLOSE_TO_CHECKIN;
    }

    return true;
  }

  async validateUserProperty(
    user: User,
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<true | object> {
    const checkinYear = checkinDate.getFullYear();
    const checkoutYear = checkoutDate.getFullYear();

    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: { user: user, property: property, year: checkinYear },
    });
    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: { user: user, property: property, year: checkoutYear },
    });

    if (!userPropertyFirstYear || !userPropertySecondYear) {
      return BOOKING_RESPONSES.NO_ACCESS_TO_PROPERTY;
    }

    return true;
  }

  validateGuestLimits(
    createBookingDto: CreateBookingDTO,
    propertyDetails: PropertyDetails,
  ): true | object {
    if (
      createBookingDto.noOfGuests > propertyDetails.noOfGuestsAllowed ||
      createBookingDto.noOfPets > propertyDetails.noOfPetsAllowed
    ) {
      return BOOKING_RESPONSES.GUESTS_LIMIT_EXCEEDS;
    }

    return true;
  }

  async validateBookingGap(
    user: User,
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<true | object> {
    const today = new Date();
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

    return true;
  }

  async validateBookedDates(
    property: Property,
    checkinDate: Date,
    checkoutDate: Date,
  ): Promise<true | object> {
    const bookedDates = await this.bookingRepository.find({
      where: { property: property },
      select: ['checkinDate', 'checkoutDate'],
    });

    const isBookedDate = (date: Date): boolean =>
      bookedDates.some(
        (booking) =>
          date >= normalizeDate(booking.checkinDate) &&
          date < normalizeDate(booking.checkoutDate),
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

  isLastMinuteBooking(checkinDate: Date): boolean {
    const today = new Date();
    const diffInDays =
      (checkinDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= BookingRules.LAST_MAX_DAYS;
  }

  calculateNightsSelected(checkinDate: Date, checkoutDate: Date): number {
    return (
      (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  async validateBookingRules(
    isLastMinuteBooking: boolean,
    nightsSelected: number,
    nightCounts: NightCounts,
    user: User,
    property: Property,
    checkinDate: Date,
  ): Promise<true | object> {
    const userPropertyFirstYear = await this.userPropertiesRepository.findOne({
      where: {
        user: user,
        property: property,
        year: checkinDate.getFullYear(),
      },
    });
    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: {
        user: user,
        property: property,
        year: checkinDate.getFullYear() + 1,
      },
    });

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
      const nightsFirstYear =
        nightCounts.peakNightsInFirstYear + nightCounts.offNightsInFirstYear;
      const nightsSecondYear =
        nightCounts.peakNightsInSecondYear + nightCounts.offNightsInSecondYear;
      if (
        nightsFirstYear > userPropertyFirstYear.lastMinuteRemainingNights ||
        nightsSecondYear > userPropertySecondYear.lastMinuteRemainingNights
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_LAST_MIN_BOOKING_NIGHTS;
      }
    } else {
      if (nightsSelected < BookingRules.REGULAR_MIN_NIGHTS) {
        return BOOKING_RESPONSES.REGULAR_MIN_NIGHTS(
          BookingRules.REGULAR_MIN_NIGHTS,
        );
      }
      const nightsFirstYear =
        nightCounts.peakNightsInFirstYear + nightCounts.offNightsInFirstYear;
      const nightsSecondYear =
        nightCounts.peakNightsInSecondYear + nightCounts.offNightsInSecondYear;
      if (
        nightsFirstYear > userPropertyFirstYear.maximumStayLength ||
        nightsSecondYear > userPropertySecondYear.maximumStayLength
      ) {
        return BOOKING_RESPONSES.MAX_STAY_LENGTH_EXCEEDED;
      }
      if (
        nightCounts.peakNightsInFirstYear >
          userPropertyFirstYear.peakRemainingNights ||
        nightCounts.peakNightsInSecondYear >
          userPropertySecondYear.peakRemainingNights
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_PEAK_NIGHTS;
      }
      if (
        nightCounts.offNightsInFirstYear >
          userPropertyFirstYear.offRemainingNights ||
        nightCounts.offNightsInSecondYear >
          userPropertySecondYear.offRemainingNights
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_OFF_NIGHTS;
      }
      const isValidCrossYearHoliday = await this.validatePeakSeasonHolidays(
        user,
        property,
        checkinDate,
        nightCounts.peakHolidayNightsInFirstYear,
        nightCounts.peakHolidayNightsInSecondYear,
      );
      if (!isValidCrossYearHoliday) {
        return BOOKING_RESPONSES.INSUFFICIENT_PEAK_HOLIDAY_NIGHTS;
      }
      if (
        nightCounts.offHolidayNightsInFirstYear >
          userPropertyFirstYear.offRemainingHolidayNights ||
        nightCounts.offHolidayNightsInSecondYear >
          userPropertySecondYear.offRemainingHolidayNights
      ) {
        return BOOKING_RESPONSES.INSUFFICIENT_OFF_HOLIDAY_NIGHTS;
      }
    }

    return true;
  }

  async saveBooking(
    createBookingDto: CreateBookingDTO,
    property: Property,
    propertyDetails: PropertyDetails,
    isLastMinuteBooking: boolean,
    nightsSelected: number,
  ): Promise<Booking> {
    const booking = this.bookingRepository.create(createBookingDto);

    booking.bookingId = await generateBookingId(
      this.bookingRepository,
      property.id,
    );
    booking.cleaningFee = propertyDetails.cleaningFee;
    booking.petFee = createBookingDto.noOfPets * propertyDetails.feePerPet;
    booking.isLastMinuteBooking = isLastMinuteBooking;
    booking.totalNights = nightsSelected;
    booking.checkinDate = new Date(createBookingDto.checkinDate);
    booking.checkinDate.setHours(propertyDetails.checkInTime, 0, 0, 0);
    booking.checkoutDate = new Date(createBookingDto.checkoutDate);
    booking.checkoutDate.setHours(propertyDetails.checkOutTime, 0, 0, 0);

    return this.bookingRepository.save(booking);
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
      where: { user, property, year: firstYear },
    });

    const userPropertySecondYear = await this.userPropertiesRepository.findOne({
      where: { user, property, year: secondYear },
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
      where: { user, property, year },
    });
    if (userProperty) {
      await updatePeakHoliday(
        year,
        nights,
        this.userPropertiesRepository,
        userProperty.acquisitionDate,
        user,
        property,
      );
    }
  }

  async sendBookingConfirmationEmail(booking: Booking): Promise<void | Error> {
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

      const banner = await this.spaceTypesRepository.findOne({
        where: { name: 'Banner', space: { id: 1 } },
      });

      if (!banner) {
        this.logger.warn('Banner space type not found');
      }

      let imageUrl = '';
      if (banner) {
        const image = await this.propertyImagesRepository.findOne({
          where: {
            spaceType: { id: banner.id },
            property: { id: booking.property.id },
          },
        });

        if (image) {
          imageUrl = image.imageUrl;
          this.logger.log(`Banner Image URL: ${imageUrl}`);
        } else {
          this.logger.warn(
            `No banner image found for property ID: ${booking.property.id}`,
          );
        }
      }

      const { primaryEmail: email } = contacts[0];
      if (!email) {
        throw new Error(
          `Primary email not found for user ID: ${booking.user.id}`,
        );
      }

      const propertyName = await this.getProperty(booking.property.id);

      const subject = mailSubject.booking.confirmation;
      const template = mailTemplates.booking.confirmation;
      const context = {
        ownerName: `${owner.firstName} ${owner.lastName}`,
        propertyName: propertyName.propertyName || 'N/A',
        bookingId: booking.bookingId || 'N/A',
        checkIn: booking.checkinDate
          ? format(booking.checkinDate, 'MM/dd/yyyy @ KK:mm aa')
          : 'N/A',
        checkOut: booking.checkoutDate
          ? format(booking.checkoutDate, 'MM/dd/yyyy @ KK:mm aa')
          : 'N/A',
        adults: booking.noOfAdults || 0,
        children: booking.noOfChildren || 0,
        pets: booking.noOfPets || 0,
        notes: booking.notes || 'None',
        banner: imageUrl || 'default-banner-url.jpg',
        totalNights: booking.totalNights || 0,
        modify: `${authConstants.hostname}:${authConstants.port}/${authConstants.endpoints.booking}`,
        cancel: `${authConstants.hostname}:${authConstants.port}/${authConstants.endpoints.booking}`,
      };

      await this.mailService.sendMail(email, subject, template, context);
      this.logger.log(`Booking confirmation email has been sent to: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email: ${error.message}`,
      );
    }
  }

  async createBookingHistory(
    booking: Booking,
    createdBy: User,
    userAction: string,
  ): Promise<void> {
    const bookingHistory = this.bookingHistoryRepository.create({
      ...booking,
      modifiedBy: createdBy,
      userAction: userAction,
    });
    await this.bookingHistoryRepository.save(bookingHistory);
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

    return (
      peakHolidayNightsInFirstYear + peakHolidayNightsInSecondYear <=
      remainingNights
    );
  }
}
