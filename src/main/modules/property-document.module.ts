import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { User } from 'entities/user.entity';
import { AuthenticationModule } from './authentication.module';
import { Property } from '../entities/property.entity';
import { S3UtilsModule } from './s3-utils.module';
import { PropertyDocumentsController } from '../controller/property-document.controller';
import { PropertyDocuments } from '../entities/property-document.entity';
import { PropertyDocumentsService } from '../service/property-document.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyDocuments, User, Property]),
    LoggerModule,
    AuthenticationModule,
    S3UtilsModule,
  ],
  controllers: [PropertyDocumentsController],
  providers: [PropertyDocumentsService],
})
export class PropertyDocumentsModule {}
