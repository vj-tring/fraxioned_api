import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingHistory } from '../entities/booking-history.entity';
import { ReportsService } from '../service/reports.service';
import { ReportsController } from '../controller/reports.controller';
import { AuthenticationModule } from './authentication.module';
import { UserProperties } from '../entities/user-properties.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingHistory, UserProperties]),
    AuthenticationModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
