import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDocumentController } from 'controllers/user-document.controller';
import { UserDocumentService } from 'services/user-document.service';
import { UserDocument } from 'entities/user-documents.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from 'entities/user.entity';
import { Properties } from 'entities/properties.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDocument, User, Properties]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [UserDocumentController],
  providers: [UserDocumentService],
  exports: [UserDocumentService],
})
export class UserDocumentModule {}
