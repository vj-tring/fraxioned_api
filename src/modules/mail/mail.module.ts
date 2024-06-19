import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailConfigModule } from './mail-config.module';
import { LoggerModule } from '@logger/logger.module';

@Module({
  imports: [MailConfigModule, LoggerModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
