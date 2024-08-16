import { Module } from '@nestjs/common';
import { PropertyDetails } from '../entities/property-details.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyDetailsController } from '../controller/property-details.controller';
import { PropertyDetailsService } from '../service/property-details.service';
import { Property } from '../entities/property.entity';
import { AuthenticationModule } from './authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyDetails, Property]),
    AuthenticationModule,
  ],
  controllers: [PropertyDetailsController],
  providers: [PropertyDetailsService],
})
export class PropertyDetailsModule {}
