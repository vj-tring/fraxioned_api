import { Module } from '@nestjs/common';
import { PropertyCodesController } from '../controller/property-codes.controller';
import { PropertyCodesService } from '../service/property-codes.service';
import { PropertyCodes } from '../entities/property_codes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { AuthenticationModule } from './authentication.module';
import { PropertyCodeCategory } from '../entities/property-code-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyCodes, Property, PropertyCodeCategory]),
    AuthenticationModule,
  ],
  controllers: [PropertyCodesController],
  providers: [PropertyCodesService],
})
export class PropertyCodesModule {}
