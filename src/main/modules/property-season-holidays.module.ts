import { Module } from '@nestjs/common';
import { PropertySeasonHolidaysService } from '../service/property-season-holidays.service';
import { PropertySeasonHolidaysController } from '../controller/property-season-holidays.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertySeasonHolidays } from '../entities/property-season-holidays.entity';
import { User } from '../entities/user.entity';
import { LoggerModule } from './logger.module';
import { Holidays } from '../entities/holidays.entity';
import { Properties } from '../entities/properties.entity';
import { AuthenticationModule } from './authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertySeasonHolidays,
      User,
      Holidays,
      Properties,
    ]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [PropertySeasonHolidaysController],
  providers: [PropertySeasonHolidaysService],
})
export class PropertySeasonHolidaysModule {}
