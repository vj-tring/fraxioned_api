import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingHistory } from '../../entities/booking-history.entity';
import { BookingValidationService } from './booking-validation.service';
import { BookingCalculationService } from './booking-calculation.service';
import { UserPropertiesUpdateService } from './user-properties-update.service';
import { format } from 'date-fns';
import { User } from 'src/main/entities/user.entity';
import { MailService } from 'src/main/email/mail.service';
import { LoggerService } from '../logger.service';
import { CreateBookingDTO } from 'src/main/dto/requests/booking/create-booking.dto';
import { generateBookingId } from './utils/booking.util';
import { BOOKING_RESPONSES } from 'src/main/commons/constants/response-constants/booking.constant';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';

@Injectable()
export class CreateBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingHistory)
    private readonly bookingHistoryRepository: Repository<BookingHistory>,
    private readonly bookingValidationService: BookingValidationService,
    private readonly bookingCalculationService: BookingCalculationService,
    private readonly userPropertiesUpdateService: UserPropertiesUpdateService,
    @InjectRepository(UserContactDetails)
    private readonly userContactDetailsRepository: Repository<UserContactDetails>,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async createBooking(createBookingDto: CreateBookingDTO): Promise<object> {
    this.logger.log('Creating a new booking');

    const validationResult =
      await this.bookingValidationService.validateBooking(createBookingDto);
    if (validationResult !== true) {
      return validationResult;
    }

    const calculationResult =
      await this.bookingCalculationService.calculateBookingDetails(
        createBookingDto,
      );

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      ...calculationResult,
      bookingId: await generateBookingId(
        this.bookingRepository,
        createBookingDto.property.id,
      ),
    });

    const savedBooking = await this.bookingRepository.save(booking);

    await this.userPropertiesUpdateService.updateUserProperties(savedBooking);

    await this.sendBookingConfirmationEmail(savedBooking);

    await this.createBookingHistory(savedBooking, createBookingDto.createdBy);

    return BOOKING_RESPONSES.BOOKING_CREATED(savedBooking);
  }

  private async sendBookingConfirmationEmail(booking: Booking): Promise<void> {
    const contact = await this.userContactDetailsRepository.findOne({
      where: {
        user: {
          id: booking.user.id,
        },
      },
      select: ['primaryEmail'],
    });

    if (!contact) {
      throw new Error('User contact details not found');
    }

    const {
      user,
      property,
      bookingId,
      checkinDate,
      checkoutDate,
      noOfAdults,
      noOfChildren,
      noOfPets,
      notes,
    } = booking;
    const email = contact.primaryEmail;
    const subject = 'Booking Confirmation';
    const template = 'booking-confirmation';
    const context = {
      ownerName: `${user.firstName} ${user.lastName}`,
      propertyName: property.propertyName,
      bookingId,
      checkIn: format(checkinDate, 'MM/dd/yyyy @ KK:mm aa'),
      checkOut: format(checkoutDate, 'MM/dd/yyyy @ KK:mm aa'),
      adults: noOfAdults,
      children: noOfChildren,
      pets: noOfPets,
      notes,
    };

    await this.mailService.sendMail(email, subject, template, context);
    this.logger.log(
      `Booking confirmation mail has been sent to mail : ${email}`,
    );
  }

  private async createBookingHistory(
    booking: Booking,
    createdBy: User,
  ): Promise<void> {
    const bookingHistory = this.bookingHistoryRepository.create({
      ...booking,
    });
    bookingHistory.modifiedBy = createdBy;
    bookingHistory.userAction = 'Created';
    await this.bookingHistoryRepository.save(bookingHistory);
  }
}
