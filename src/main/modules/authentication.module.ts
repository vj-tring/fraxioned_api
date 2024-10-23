import { Module } from '@nestjs/common';
import { AuthenticationService } from '../service/auth/authentication.service';
import { AuthenticationController } from '../controller/authentication.controller';
import { User } from 'src/main/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/main/entities/role.entity';
import { LoggerModule } from 'src/main/modules/logger.module';
import { UserSession } from 'entities/user-session.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { Property } from '../entities/property.entity';
import { MailModule } from '../email/mail.module';
import { PropertyDetails } from '../entities/property-details.entity';
import { InviteService } from '../service/auth/invite.service';
import { UserRepository } from '../repository/user.repository';
import { PropertyRepository } from '../repository/property.repository';
import { PropertyDetailsRepository } from '../repository/property-details.repository';
import { UserPropertyRepository } from '../repository/user-property.repository';
import { UserContactRepository } from '../repository/user-contact.repository';
import { RoleRepository } from '../repository/role.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      UserContactDetails,
      UserProperties,
      Role,
      Property,
      PropertyDetails,
    ]),
    LoggerModule,
    MailModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    InviteService,
    RoleRepository,
    UserRepository,
    UserContactRepository,
    PropertyDetailsRepository,
    PropertyRepository,
    PropertyDetailsRepository,
    UserPropertyRepository,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
