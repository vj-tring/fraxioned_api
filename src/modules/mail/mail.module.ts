import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailConfigModule } from './mail-config.module';

@Module({
  imports: [MailConfigModule],
  providers: [MailService],
  exports: [MailService],

})
export class MailModule {}
