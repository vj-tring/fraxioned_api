import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPropertyController } from '../controller/user-property.controller';
import { UserPropertyService } from '../service/user-property.service';
import { UserProperties } from '../entities/user-properties.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { Property } from '../entities/property.entity';
import { PropertyDetails } from '../entities/property-details.entity';
import { UserPropertyRepository } from '../repository/user-property.repository';
import { UserRepository } from '../repository/user.repository';
import { PropertyRepository } from '../repository/property.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProperties, User, Property, PropertyDetails]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [UserPropertyController],
  providers: [
    UserPropertyService,
    UserPropertyRepository,
    UserRepository,
    PropertyRepository,
  ],
  exports: [UserPropertyService],
})
export class UserPropertyModule {}
