import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { Amenities } from '../entities/amenities.entity';
import { AmenitiesController } from '../controller/amenities.controller';
import { AmenitiesService } from '../service/amenities.service';
import { PropertyAmenities } from '../entities/property-amenities.entity';
import { AmenityGroup } from '../entities/amenity-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Amenities,
      User,
      PropertyAmenities,
      AmenityGroup,
    ]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}
