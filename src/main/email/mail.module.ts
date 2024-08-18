import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { mailConfigAsync } from '../config/mail.config';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [MailerModule.forRootAsync(mailConfigAsync)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
