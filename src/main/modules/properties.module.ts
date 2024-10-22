import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from 'src/main/controller/properties.controller';
import { Property } from 'src/main/entities/property.entity';
import { PropertiesService } from 'src/main/service/properties.service';
import { AuthenticationModule } from 'src/main/modules/authentication.module';
import { PropertyDetailsModule } from './property-details.module';
import { PropertyDetails } from '../entities/property-details.entity';
import { UserProperties } from '../entities/user-properties.entity';
import { User } from '../entities/user.entity';
import { LoggerModule } from './logger.module';
import { S3UtilsModule } from './s3-utils.module';
import { PropertySpaceModule } from './property-space.module';
import { PropertyAdditionalImageModule } from './property-additional-image.module';
import { PropertySpaceAmenitiesModule } from './property-space-amenity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, PropertyDetails, UserProperties, User]),
    AuthenticationModule,
    LoggerModule,
    PropertyDetailsModule,
    S3UtilsModule,
    PropertySpaceAmenitiesModule,
    forwardRef(() => PropertySpaceModule),
    forwardRef(() => PropertyAdditionalImageModule),
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
