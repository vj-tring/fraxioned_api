import { Module } from '@nestjs/common';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule, MailModule, UserModule, ContactUsModule],
})
export class AppModule {}
