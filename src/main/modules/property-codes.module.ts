import { Module } from '@nestjs/common';
import { PropertyCodesController } from '../controller/property-codes.controller';
import { PropertyCodesService } from '../service/property-codes.service';
import { PropertyCodes } from '../entities/property-codes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { AuthenticationModule } from './authentication.module';
import { PropertyCodeCategory } from '../entities/property-code-category.entity';
import { User } from '../entities/user.entity';
import { PropertyCodeCategoryModule } from './property-code-category.module';
import { LoggerModule } from './logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyCodes,
      Property,
      PropertyCodeCategory,
      User,
    ]),
    AuthenticationModule,
    PropertyCodeCategoryModule,
    LoggerModule,
  ],
  controllers: [PropertyCodesController],
  providers: [PropertyCodesService],
})
export class PropertyCodesModule {}
