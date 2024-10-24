import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'controllers/user.controller';
import { UserService } from 'services/user.service';
import { User } from 'entities/user.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { Role } from 'entities/role.entity';
import { UserContactDetails } from 'entities/user-contact-details.entity';
import { S3UtilsModule } from './s3-utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserContactDetails]),
    LoggerModule,
    AuthenticationModule,
    S3UtilsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
