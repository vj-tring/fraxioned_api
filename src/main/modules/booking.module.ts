import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'entities/booking.entity';
import { BookingService } from 'src/main/service/booking/booking.service';
import { BookingController } from 'src/main/controller/booking.controller';
import { LoggerService } from 'services/logger.service';
import { UserProperties } from '../entities/user-properties.entity';
import { PropertyDetails } from '../entities/property-details.entity';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';
import { CreateBookingService } from '../service/booking/create-booking';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      UserProperties,
      PropertyDetails,
      PropertySeasonHolidays,
      User,
    ]),
    AuthenticationModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, LoggerService, CreateBookingService],
})
export class BookingModule {}
