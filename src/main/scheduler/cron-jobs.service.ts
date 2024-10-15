import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { LoggerService } from '../service/logger.service';
import { CronJob } from 'cron';

@Injectable()
export class CronJobsService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly logger: LoggerService,
  ) {}

  async addCronJob(
    name: string,
    cronTime: string,
    callback: () => void,
  ): Promise<void> {
    const job = new CronJob(`${cronTime}`, async () => {
      this.logger.warn(`time (${cronTime}) for job '${name}' to run!`);
      try {
        await callback();
      } catch (error) {
        this.logger.error(`Error executing job ${name}: ${error.message}`);
      }
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    this.logger.warn(`job '${name}' added for time at ${cronTime}!`);

    return;
  }

  deleteCron(name: string): Promise<void> {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`job '${name}' deleted!`);

    return;
  }

  getCrons(): Map<string, CronJob<null, null>> {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key) => {
      let next: Date | string;
      try {
        next = value.nextDate().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      this.logger.log(`job: ${key} -> next: ${next}`);
    });

    return jobs;
  }
}
