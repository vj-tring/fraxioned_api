import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaImage } from '../entities/media-image.entity';
import { MediaImageController } from '../controller/media-image.controller';
import { Amenities } from '../entities/amenities.entity';
import { PropertySpace } from '../entities/property-space.entity';
import { Property } from '../entities/property.entity';
import { SpaceBathroomTypes } from '../entities/space-bathroom-types.entity';
import { SpaceBedType } from '../entities/space-bed-type.entity';
import { Space } from '../entities/space.entity';
import { User } from '../entities/user.entity';
import { MediaImageService } from '../service/media-image.service';
import { S3UtilsModule } from './s3-utils.module';
import { AuthenticationModule } from './authentication.module';
import { LoggerModule } from './logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MediaImage,
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
  controllers: [MediaImageController],
  providers: [MediaImageService],
  exports: [MediaImageService],
})
export class MediaImageModule {}
