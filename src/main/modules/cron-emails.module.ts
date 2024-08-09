import { Module } from '@nestjs/common';
import { CronEmailsService } from 'src/main/service/cron-emails.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './mail.module';

@Module({
  imports: [ScheduleModule.forRoot(), MailModule],
  providers: [CronEmailsService],
})
export class CronEmailsModule {}
