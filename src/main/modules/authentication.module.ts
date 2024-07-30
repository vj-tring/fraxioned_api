import { Module } from '@nestjs/common';
import { AuthenticationService } from '../service/authentication.service';
import { AuthenticationController } from '../controller/authentication.controller';
import { Users } from 'src/main/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/main/entities/role.entity';
import { MailModule } from 'src/main/modules/mail.module';
import { LoggerModule } from 'src/main/modules/logger.module';
import { UserSessions } from 'src/main/entities/user_sessions.entity';
import { UserContactDetails } from 'src/main/entities/user_contact_details.entity';
import { UserProperties } from 'src/main/entities/user_properties.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
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
