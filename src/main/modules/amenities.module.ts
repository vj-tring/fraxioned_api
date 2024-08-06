import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { Amenities } from '../entities/amenities.entity';
import { AmenitiesController } from '../controller/amenities.controller';
import { AmenitiesService } from '../service/amenities.service';
import { PropertyAmenities } from '../entities/property_amenities.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Amenities, User, PropertyAmenities]),
    PropertyAmenities,
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
})
export class AmenitiesModule {}
