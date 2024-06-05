import { Module } from '@nestjs/common';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule, MailModule, UserModule],
})
export class AppModule {}
