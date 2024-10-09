import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { Amenities } from '../entities/amenities.entity';
import { AmenitiesController } from '../controller/amenities.controller';
import { AmenitiesService } from '../service/amenities.service';
import { PropertySpaceAmenities } from '../entities/property-space-amenity.entity';
import { PropertyDocumentsModule } from './property-document.module';
import { AmenityGroup } from '../entities/amenity-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Amenities,
      User,
      PropertySpaceAmenities,
      AmenityGroup,
    ]),
    LoggerModule,
    AuthenticationModule,
    PropertyDocumentsModule,
  ],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}
