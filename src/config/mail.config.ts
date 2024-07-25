import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailConfig {
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
  FROM_EMAIL: string;

  constructor(private configService: ConfigService) {
    this.SMTP_HOST = this.configService.get<string>('MAIL_HOST');
    this.SMTP_PORT = this.configService.get<number>('MAIL_PORT');
    this.SMTP_USERNAME = this.configService.get<string>('MAIL_USER');
    this.SMTP_PASSWORD = this.configService.get<string>('MAIL_PASSWORD');
    this.FROM_EMAIL = this.configService.get<string>('MAIL_FROM');
  }
}
