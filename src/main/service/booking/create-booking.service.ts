import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'entities/booking.entity';
import { LoggerService } from 'services/logger.service';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { CreateBookingDTO } from '../../dto/requests/booking/create-booking.dto';
import { PropertyDetails } from '../../entities/property-details.entity';
import { BookingUtilService } from 'src/main/service/booking/utils/booking.service.util';
import { Property } from 'src/main/entities/property.entity';
import { normalizeDates } from './utils/date.util';
import { generateBookingId } from './utils/booking-id.util';
import { BookingMailService } from './utils/mail.util';
import { BookingValidationService } from './utils/validation.util';

@Injectable()
export class CreateBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly logger: LoggerService,
    private readonly bookingUtilService: BookingUtilService,
    private readonly bookingMailService: BookingMailService,
    private readonly bookingValidationService: BookingValidationService,
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
      await this.bookingValidationService.validateBookingRules(
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

    const preparedBooking = await this.prepareBooking(
      createBookingDto,
      property,
      propertyDetails,
      isLastMinuteBooking,
      nightsSelected,
    );

    const ownerRezData =
      await this.bookingUtilService.createBookingOnOwnerRez(preparedBooking);
    if (!ownerRezData) {
      return BOOKING_RESPONSES.OWNER_REZ_BOOKING_FAILED;
    }

    const savedBooking = await this.saveBooking(preparedBooking);

    await this.bookingUtilService.updateUserProperties(
      user,
      property,
      checkinDate,
      checkoutDate,
      nightCounts,
      isLastMinuteBooking,
    );

    await this.bookingMailService.sendBookingConfirmationEmail(savedBooking);

    const userAction = 'Created';
    await this.bookingUtilService.createBookingHistory(
      savedBooking,
      createBookingDto.createdBy,
      userAction,
    );

    return BOOKING_RESPONSES.BOOKING_CREATED(savedBooking);
  }

  async saveBooking(booking: Booking): Promise<Booking> {
    return this.bookingRepository.save(booking);
  }

  async prepareBooking(
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
    booking.property.id = property.id;
    booking.property.ownerRezPropId = property.ownerRezPropId;

    return booking;
  }
}
