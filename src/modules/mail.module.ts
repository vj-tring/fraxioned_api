import { Module } from '@nestjs/common';
import { MailService } from '../service/mail.service';
import { MailConfigModule } from '../config/mail-config.module';
import { LoggerModule } from 'src/modules/logger.module';

@Module({
  imports: [MailConfigModule, LoggerModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
