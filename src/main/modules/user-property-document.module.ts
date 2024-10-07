import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from 'entities/user.entity';
import { Property } from 'entities/property.entity';
import { S3UtilsModule } from './s3-utils.module';
import { UserPropertyDocumentsController } from '../controller/user-property-document.controller';
import { UserPropertyDocumentsService } from '../service/user-property-document.service';
import { UserPropertyDocument } from '../entities/user-property-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPropertyDocument, User, Property]),
    LoggerModule,
    AuthenticationModule,
    S3UtilsModule,
  ],
  controllers: [UserPropertyDocumentsController],
  providers: [UserPropertyDocumentsService],
  exports: [UserPropertyDocumentsService],
})
export class UserDocumentModule {}
