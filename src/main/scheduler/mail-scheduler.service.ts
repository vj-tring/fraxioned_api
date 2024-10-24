import { Injectable, OnModuleInit } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { LoggerService } from '../service/logger.service';
import {
  reminderDays,
  ReminderType,
} from '../commons/constants/email/mail.constants';
import { BookingMailService } from '../utils/booking/mail.util';

interface CronJobConfig {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
}

@Injectable()
export class MailSchedulerService implements OnModuleInit {
  private initializedJobs: Set<string> = new Set();

  constructor(
    private readonly cronJobsService: CronJobsService,
    private readonly logger: LoggerService,
    private readonly bookingMailService: BookingMailService,
  ) {}

  async sendBookingReminderEmails(): Promise<void> {
    try {
      this.logger.log('Sending booking reminder emails...');
      await this.bookingMailService.sendReminderEmail(
        reminderDays.upcoming,
        'upcoming reminder',
        ReminderType.UPCOMING,
      );
      await this.bookingMailService.sendReminderEmail(
        reminderDays.final,
        'final reminder',
        ReminderType.FINAL,
      );
      await this.bookingMailService.sendReminderEmail(
        reminderDays.instructions,
        'checkout instructions reminder',
        ReminderType.INSTRUCTIONS,
        true,
      );
      this.logger.log('Sent booking reminder emails!');
    } catch (error) {
      this.logger.error(error);
    }
  }

  async initializeCronJob(jobConfig: CronJobConfig): Promise<void> {
    if (this.initializedJobs.has(jobConfig.name)) {
      this.logger.log(
        `Cron job '${jobConfig.name}' already initialized in this instance. Skipping...`,
      );
      return;
    }

    const existingJobs = this.cronJobsService.getCrons();
    if (existingJobs.has(jobConfig.name)) {
      this.logger.log(
        `Cron job '${jobConfig.name}' already exists in scheduler. Skipping initialization.`,
      );
      this.initializedJobs.add(jobConfig.name);
      return;
    }

    await this.cronJobsService.addCronJob(
      jobConfig.name,
      jobConfig.schedule,
      jobConfig.handler.bind(this),
    );

    this.initializedJobs.add(jobConfig.name);
    this.logger.log(`Cron job '${jobConfig.name}' initialized successfully.`);
  }

  async onModuleInit(): Promise<void> {
    const jobConfigs: CronJobConfig[] = [
      {
        name: 'sendBookingReminderEmails',
        schedule: '0 0 15 * * *',
        handler: this.sendBookingReminderEmails,
      },
    ];

    for (const jobConfig of jobConfigs) {
      await this.initializeCronJob(jobConfig);
    }
  }
}
