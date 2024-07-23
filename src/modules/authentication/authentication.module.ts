import { Module } from '@nestjs/common';
import { AuthenticationService } from '../../service/Authentication/authentication.service';
import { AuthenticationController } from '../../controller/Authentication/authentication.controller';
import { User } from 'entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'entities/role.entity';
import { Sessions } from 'entities/sessions.entity';
import { UserRole } from 'entities/user_role.entity';
import { MailModule } from 'modules/mail/mail.module';
import { LoggerModule } from 'modules/Logger/logger.module';
import { UserAddressDetails } from 'entities/user_address_details.entity';
import { UserEmailDetails } from 'entities/user_email_details.entity';
import { UserPhoneDetails } from 'entities/user_phone_details.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserAddressDetails,
      UserRole,
      UserEmailDetails,
      UserPhoneDetails,
      Sessions,
      Role,
      UserRole,
    ]),
    MailModule,
    LoggerModule,
    
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
