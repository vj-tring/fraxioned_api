import { Module } from '@nestjs/common';
import { AuthenticationService } from '../service/authentication.service';
import { AuthenticationController } from '../controller/authentication.controller';
import { User } from 'src/main/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/main/entities/role.entity';
import { MailModule } from 'src/main/modules/mail.module';
import { LoggerModule } from 'src/main/modules/logger.module';
import { UserSession } from 'entities/user-session.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { Property } from '../entities/property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      UserContactDetails,
      UserProperties,
      Role,
      Property,
    ]),
    MailModule,
    LoggerModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
