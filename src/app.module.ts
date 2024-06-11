import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { RulesModule } from './modules/rules/rules.module';

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    MailModule,
    UserModule,
    RulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
