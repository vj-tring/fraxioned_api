import { Module } from '@nestjs/common';
import { MailService } from '../../service/Mail/mail.service';
import { MailConfigModule } from '../../config/Mail/mail-config.module';
import { LoggerModule } from '@logger/logger.module';

@Module({
  imports: [MailConfigModule, LoggerModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
