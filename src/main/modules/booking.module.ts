import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'entities/booking.entity';
import { BookingService } from 'src/main/service/booking/booking.service';
import { BookingController } from 'src/main/controller/booking.controller';
import { LoggerService } from 'services/logger.service';
import { UserProperties } from '../entities/user-properties.entity';
import { PropertyDetails } from '../entities/property-details.entity';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';
import { CreateBookingService } from '../service/booking/create-booking.service';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { BookingHistory } from '../entities/booking-history.entity';
import { BookingSummaryService } from '../service/booking/booking-summary.service';
import { UserContactDetails } from '../entities/user-contact-details.entity';
import { MailService } from '../email/mail.service';
import { Property } from '../entities/property.entity';
import { Space } from '../entities/space.entity';
import { UpdateBookingService } from '../service/booking/booking-update.service';
import { CancelBookingService } from '../service/booking/booking-cancel.service';
import { AdminBookingService } from '../service/booking/admin-booking.service';
import { BookingUtilService } from '../utils/booking/booking.service.util';
import { BookingMailService } from '../utils/booking/mail.util';
import { BookingValidationService } from '../utils/booking/validation.util';
import { PropertyCodes } from '../entities/property-codes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingHistory,
      UserProperties,
      PropertyDetails,
      Property,
      PropertySeasonHolidays,
      User,
      UserContactDetails,
      Space,
      PropertyCodes,
    ]),
    AuthenticationModule,
  ],
  controllers: [BookingController],
  providers: [
    BookingService,
    LoggerService,
    CreateBookingService,
    BookingSummaryService,
    MailService,
    UpdateBookingService,
    CancelBookingService,
    AdminBookingService,
    BookingUtilService,
    BookingMailService,
    BookingValidationService,
  ],
  exports: [BookingMailService],
})
export class BookingModule {}
