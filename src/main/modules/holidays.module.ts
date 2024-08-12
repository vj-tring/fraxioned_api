import { Module } from '@nestjs/common';
import { HolidaysService } from 'services/holidays.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidaysController } from 'controllers/holidays.controller';
import { LoggerModule } from './logger.module';
import { UserModule } from './user.module';
import { Holidays } from 'entities/holidays.entity';
import { User } from 'entities/user.entity';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';
import { AuthenticationModule } from './authentication.module';
import { PropertySeasonHolidaysModule } from './property-season-holidays.module';
import { PropertyDetailsModule } from './property-details.module';
import { PropertyDetails } from '../entities/property-details.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Holidays,
      User,
      PropertySeasonHolidays,
      PropertyDetails,
    ]),
    LoggerModule,
    UserModule,
    PropertySeasonHolidaysModule,
    AuthenticationModule,
    PropertyDetailsModule,
  ],
  controllers: [HolidaysController],
  providers: [HolidaysService],
})
export class HolidaysModule {}
