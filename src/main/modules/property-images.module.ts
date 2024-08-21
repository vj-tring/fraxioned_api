import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { User } from 'entities/user.entity';
import { AuthenticationModule } from './authentication.module';
import { Property } from '../entities/property.entity';
import { PropertyImages } from '../entities/property_images.entity';
import { PropertyImagesController } from '../controller/property-images.controller';
import { PropertyImagesService } from '../service/property-images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyImages, User, Property]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [PropertyImagesController],
  providers: [PropertyImagesService],
})
export class PropertyImagesModule {}
