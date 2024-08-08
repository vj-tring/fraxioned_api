import { Module } from '@nestjs/common';
import { PropertyCodesController } from '../controller/property-codes.controller';
import { PropertyCodesService } from '../service/property-codes.service';
import { PropertyCodes } from '../entities/property_codes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyCodes])],
  controllers: [PropertyCodesController],
  providers: [PropertyCodesService],
})
export class PropertyCodesModule {}
