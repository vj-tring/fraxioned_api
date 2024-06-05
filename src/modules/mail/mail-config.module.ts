import { Module } from '@nestjs/common';
import { MailConfig } from './mail.config';

@Module({
  providers: [MailConfig],
  exports: [MailConfig],
})
export class MailConfigModule {}
