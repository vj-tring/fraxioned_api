import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { User } from 'entities/user.entity';
import { AuthenticationModule } from './authentication.module';
import { Property } from '../entities/property.entity';
import { PropertyImages } from '../entities/property_images.entity';
import { PropertyImagesController } from '../controller/property-images.controller';
import { PropertyImagesService } from '../service/property-images.service';
import { Space } from '../entities/space.entity';
import { SpaceTypes } from '../entities/space-types.entity';
import { S3UtilsModule } from './s3-utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyImages,
      User,
      Property,
      SpaceTypes,
      Space,
    ]),
    LoggerModule,
    AuthenticationModule,
    S3UtilsModule,
  ],
  controllers: [PropertyImagesController],
  providers: [PropertyImagesService],
})
export class PropertyImagesModule {}
