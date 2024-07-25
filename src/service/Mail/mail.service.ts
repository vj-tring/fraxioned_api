import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { MailConfig } from 'config/Mail/mail.config';
import { LoggerService } from 'services/Logger/logger.service';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(
    private mailConfig: MailConfig,
    private logger: LoggerService,
  ) {
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

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: this.mailConfig.FROM_EMAIL,
      to,
      subject,
      text,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to} with subject: ${subject}`);
      return result;
    } catch (error) {
      this.logger.error(error.stack);
      throw error;
    }
  }
}
