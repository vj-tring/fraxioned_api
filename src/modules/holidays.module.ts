import { Module } from '@nestjs/common';
import { HolidaysService } from 'src/service/holidays.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidaysController } from 'src/controller/holidays.controller';
import { LoggerModule } from './logger.module';
import { UsersModule } from './users.module';
import { Holidays } from 'src/entities/holidays.entity';
import { Users } from 'src/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Holidays, Users]),
    LoggerModule,
    UsersModule,
  ],
  controllers: [HolidaysController],
  providers: [HolidaysService],
})
export class HolidaysModule {}
