import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertySapceImage } from '../entities/property-space-image.entity';
import { PropertySpaceImageController } from '../controller/property-space-image.controller';
import { Amenities } from '../entities/amenities.entity';
import { PropertySpace } from '../entities/property-space.entity';
import { Property } from '../entities/property.entity';
import { SpaceBathroomTypes } from '../entities/space-bathroom-types.entity';
import { SpaceBedType } from '../entities/space-bed-type.entity';
import { Space } from '../entities/space.entity';
import { User } from '../entities/user.entity';
import { PropertySpaceImageService } from '../service/property-space-image.service';
import { S3UtilsModule } from './s3-utils.module';
import { AuthenticationModule } from './authentication.module';
import { LoggerModule } from './logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertySapceImage,
      Property,
      Amenities,
      PropertySpace,
      SpaceBathroomTypes,
      SpaceBedType,
      Space,
      User,
    ]),
    LoggerModule,
    AuthenticationModule,
    S3UtilsModule,
  ],
  controllers: [PropertySpaceImageController],
  providers: [PropertySpaceImageService],
  exports: [PropertySpaceImageService],
})
export class PropertySpaceImageModule {}