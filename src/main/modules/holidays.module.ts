import { Module } from '@nestjs/common';
import { HolidaysService } from 'services/holidays.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidaysController } from 'controllers/holidays.controller';
import { LoggerModule } from './logger.module';
import { UsersModule } from './users.module';
import { Holidays } from 'entities/holidays.entity';
import { User } from 'entities/user.entity';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';
import { AuthenticationModule } from './authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Holidays, User, PropertySeasonHolidays]),
    LoggerModule,
    UsersModule,
    PropertySeasonHolidays,
    AuthenticationModule,
  ],
  controllers: [HolidaysController],
  providers: [HolidaysService],
})
export class HolidaysModule {}
