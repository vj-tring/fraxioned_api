import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { LoggerModule } from './logger.module';
import { Properties } from '../entities/properties.entity';
import { AuthenticationModule } from './authentication.module';
import { PropertyAmenities } from '../entities/property_amenities.entity';
import { Amenities } from '../entities/amenities.entity';
import { PropertyAmenitiesService } from '../service/property-amenities.service';
import { PropertyAmenitiesController } from '../controller/property-amenities.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyAmenities, User, Amenities, Properties]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [PropertyAmenitiesController],
  providers: [PropertyAmenitiesService],
})
export class PropertyAmenitiesModule {}