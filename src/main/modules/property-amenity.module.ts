import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { LoggerModule } from './logger.module';
import { Property } from '../entities/property.entity';
import { AuthenticationModule } from './authentication.module';
import { PropertyAmenities } from '../entities/property-amenity.entity';
import { Amenities } from '../entities/amenities.entity';
import { PropertySpace } from '../entities/property-space.entity';
import { PropertyAmenitiesService } from '../service/property-amenity.service';
import { PropertyAmenitiesController } from '../controller/property-amenity.controller';
import { PropertySpaceModule } from './property-space.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyAmenities,
      User,
      Amenities,
      Property,
      PropertySpace,
    ]),
    LoggerModule,
    AuthenticationModule,
    PropertySpaceModule,
  ],
  controllers: [PropertyAmenitiesController],
  providers: [PropertyAmenitiesService],
})
export class PropertyAmenitiesModule {}
