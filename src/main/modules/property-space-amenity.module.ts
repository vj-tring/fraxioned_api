import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { LoggerModule } from './logger.module';
import { Property } from '../entities/property.entity';
import { AuthenticationModule } from './authentication.module';
import { Amenities } from '../entities/amenities.entity';
import { PropertySpace } from '../entities/property-space.entity';
import { PropertySpaceAmenitiesService } from '../service/property-space-amenity.service';
import { PropertySpaceAmenitiesController } from '../controller/property-space-amenity.controller';
import { PropertySpaceModule } from './property-space.module';
import { PropertySpaceAmenities } from '../entities/property-space-amenity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertySpaceAmenities,
      User,
      Amenities,
      Property,
      PropertySpace,
    ]),
    LoggerModule,
    AuthenticationModule,
    PropertySpaceModule,
  ],
  controllers: [PropertySpaceAmenitiesController],
  providers: [PropertySpaceAmenitiesService],
})
export class PropertySpaceAmenitiesModule {}
