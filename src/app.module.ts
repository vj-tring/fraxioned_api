import { Module } from '@nestjs/common';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from '@mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { UserRoleModule } from './modules/user-role/user-role.module';
import { RoleModule } from './modules/user-role/role/role.module';

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    MailModule,
    UserModule,
    ContactUsModule,
    UserRoleModule,
    RoleModule,
  ],
})
export class AppModule {}
