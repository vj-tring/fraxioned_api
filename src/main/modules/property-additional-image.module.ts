import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyAdditionalImageController } from '../controller/property-additional-image.controller';
import { PropertyAdditionalImage } from '../entities/property-additional-image.entity';
import { PropertyAdditionalImageService } from '../service/property-additional-image.service';
import { S3UtilsModule } from './s3-utils.module';
import { AuthenticationModule } from './authentication.module';
import { LoggerModule } from './logger.module';
import { UserModule } from './user.module';
import { PropertiesModule } from './properties.module';
import { PropertySpaceImageModule } from './property-space-image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyAdditionalImage]),
    UserModule,
    S3UtilsModule,
    PropertiesModule,
    PropertySpaceImageModule,
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [PropertyAdditionalImageController],
  providers: [PropertyAdditionalImageService],
  exports: [PropertyAdditionalImageService],
})
export class PropertyAdditionalImageModule {}
