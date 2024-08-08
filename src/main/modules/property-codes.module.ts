import { Module } from '@nestjs/common';
import { PropertyCodesController } from '../controller/property-codes.controller';
import { PropertyCodesService } from '../service/property-codes.service';
import { PropertyCodes } from '../entities/property_codes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Properties } from '../entities/properties.entity';
import { AuthenticationModule } from './authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyCodes, Properties]),
    AuthenticationModule,
  ],
  controllers: [PropertyCodesController],
  providers: [PropertyCodesService],
})
export class PropertyCodesModule {}
