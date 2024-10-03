import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { AmenityGroup } from '../entities/amenity-group.entity';
import { AmenityGroupController } from '../controller/amenity-group.controller';
import { AmenityGroupService } from '../service/amenity-group.service';
import { User } from '../entities/user.entity';
import { UserModule } from './user.module';
import { AmenitiesModule } from './amenities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AmenityGroup, User]),
    LoggerModule,
    AuthenticationModule,
    UserModule,
    AmenitiesModule,
  ],
  controllers: [AmenityGroupController],
  providers: [AmenityGroupService],
})
export class AmenityGroupModule {}
