import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyPhoto } from '../owner-property/entity/property-photo.entity';
import { Property } from '../owner-property/entity/property.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyPhoto])],
  providers: [PropertyService],
  controllers: [PropertyController],
})
export class PropertyModule {}
