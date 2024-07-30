import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailConfig } from 'src/main/config/mail.config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [MailConfig],
  exports: [MailConfig],
})
export class MailConfigModule {}
