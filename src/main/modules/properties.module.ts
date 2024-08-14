import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from 'src/main/controller/properties.controller';
import { Property } from 'src/main/entities/property.entity';
import { PropertiesService } from 'src/main/service/properties.service';
import { AuthenticationModule } from 'src/main/modules/authentication.module';
import { PropertyDetailsModule } from './property-details.module';
import { PropertyDetails } from '../entities/property-details.entity';
import { UserProperties } from '../entities/user-properties.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, PropertyDetails, UserProperties]),
    AuthenticationModule,
    PropertyDetailsModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
