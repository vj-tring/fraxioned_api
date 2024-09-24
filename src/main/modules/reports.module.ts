import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingHistory } from '../entities/booking-history.entity';
import { ReportsService } from '../service/reports.service';
import { ReportsController } from '../controller/reports.controller';
import { AuthenticationModule } from './authentication.module';

@Module({
  imports: [TypeOrmModule.forFeature([BookingHistory]),AuthenticationModule,],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
