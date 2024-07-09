import { Module } from '@nestjs/common';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from '@mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { UserRoleModule } from './modules/user-role/user-role.module';
import { RoleModule } from './modules/user-role/role/role.module';
import { LoggerModule } from './modules/logger/logger.module';
import { OwnerPropertyModule } from './modules/owner-property/owner-property.module';
import { PropertyModule } from './modules/property/property.module';

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    MailModule,
    UserModule,
    ContactUsModule,
    UserRoleModule,
    RoleModule,
    LoggerModule,
    OwnerPropertyModule,
    PropertyModule,
  ],
})
export class AppModule {}
