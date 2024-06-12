import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailConfig } from './mail.config';

@Injectable()
export class MailService {
  private transporter: any;

  constructor(private mailConfig: MailConfig) {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.SMTP_HOST,
      port: mailConfig.SMTP_PORT,
      secure: false,
      auth: {
        user: mailConfig.SMTP_USERNAME,
        pass: mailConfig.SMTP_PASSWORD,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: this.mailConfig.FROM_EMAIL,
      to,
      subject,
      text,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendMailFromUser(from: string, to: string, subject: string, text: string) {
    const mailOptions = {
      from,
      to,
      subject,
      text,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
