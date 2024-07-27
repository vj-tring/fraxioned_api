import { Module } from '@nestjs/common';
import { HolidaysService } from 'src/service/holidays.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidaysController } from 'src/controller/holidays.controller';
import { LoggerModule } from './logger.module';
import { Holidays } from 'src/entities/holidays.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Holidays]), LoggerModule],
  controllers: [HolidaysController],
  providers: [HolidaysService],
})
export class HolidaysModule {}
