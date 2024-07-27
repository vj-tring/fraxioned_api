import { Module } from '@nestjs/common';
import { AuthenticationService } from '../service/authentication.service';
import { AuthenticationController } from '../controller/authentication.controller';
import { User } from 'entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'entities/role.entity';
import { MailModule } from 'src/modules/mail.module';
import { LoggerModule } from 'src/modules/logger.module';
import { UserSessions } from 'src/entities/user_sessions.entity';
import { UserContactDetails } from 'src/entities/user_contact_details.entity';
import { UserProperties } from 'src/entities/user_properties.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSessions,
      UserContactDetails,
      UserProperties,
      Role,
    ]),
    MailModule,
    LoggerModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
