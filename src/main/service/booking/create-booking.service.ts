import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { BookingHistory } from 'entities/booking-history.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { CreateBookingDTO } from '../../dto/requests/booking/create-booking.dto';
import { UserProperties } from 'entities/user-properties.entity';
import { PropertySeasonHolidays } from 'entities/property-season-holidays.entity';
import { PropertyDetails } from '../../entities/property-details.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import {
  generateBookingId,
  normalizeDates,
  BookingUtilService,
} from 'src/main/service/booking/utils/booking.service.util';
import { Property } from 'src/main/entities/property.entity';
import { SpaceTypes } from 'src/main/entities/space-types.entity';
import { PropertyImages } from 'src/main/entities/property_images.entity';

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
    private readonly bookingUtilService: BookingUtilService,
  ) {}

  async createBooking(createBookingDto: CreateBookingDTO): Promise<object> {
    this.logger.log('Creating a new booking');

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

    const dateValidationResult = this.bookingUtilService.validateDates(
      checkinDate,
      checkoutDate,
      propertyDetails,
    );
    if (dateValidationResult !== true) {
      return dateValidationResult;
    }

    const userPropertyValidationResult =
      await this.bookingUtilService.validateUserProperty(
        user,
        property,
        checkinDate,
        checkoutDate,
      );
    if (userPropertyValidationResult !== true) {
      return userPropertyValidationResult;
    }

    const guestValidationResult = this.bookingUtilService.validateGuestLimits(
      createBookingDto,
      propertyDetails,
    );
    if (guestValidationResult !== true) {
      return guestValidationResult;
    }

    const bookingGapValidationResult =
      await this.bookingUtilService.validateBookingGap(
        user,
        property,
        checkinDate,
        checkoutDate,
      );
    if (bookingGapValidationResult !== true) {
      return bookingGapValidationResult;
    }

    const bookedDatesValidationResult =
      await this.bookingUtilService.validateBookedDates(
        property,
        checkinDate,
        checkoutDate,
      );
    if (bookedDatesValidationResult !== true) {
      return bookedDatesValidationResult;
    }

    const nightCounts = await this.bookingUtilService.calculateNightCounts(
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

    const bookingValidationResult =
      await this.bookingUtilService.validateBookingRules(
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

    await this.bookingUtilService.updateUserProperties(
      user,
      property,
      checkinDate,
      checkoutDate,
      nightCounts,
      isLastMinuteBooking,
    );

    await this.bookingUtilService.sendBookingConfirmationEmail(savedBooking);

    const userAction = 'Created';
    await this.bookingUtilService.createBookingHistory(
      savedBooking,
      createBookingDto.createdBy,
      userAction,
    );

    return BOOKING_RESPONSES.BOOKING_CREATED(savedBooking);
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
}
