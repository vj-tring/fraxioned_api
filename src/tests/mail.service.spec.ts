import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from 'src/main/service/mail.service';
import { MailConfig } from 'src/main/config/mail.config';
import * as nodemailer from 'nodemailer';
import { LoggerService } from 'src/main/service/logger.service';
import { ConfigService } from '@nestjs/config';
import { Transporter } from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let transporterMock: jest.Mocked<Transporter>;
  let loggerService: LoggerService;
  let configService: ConfigService;

  beforeEach(async () => {
    transporterMock = {
      sendMail: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<Transporter>;
    (nodemailer.createTransport as jest.Mock).mockReturnValue(transporterMock);

    configService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'MAIL_HOST':
            return 'smtp.example.com';
          case 'MAIL_PORT':
            return 587;
          case 'MAIL_USER':
            return 'user@example.com';
          case 'MAIL_PASSWORD':
            return 'password';
          case 'MAIL_FROM':
            return 'from@example.com';
          default:
            return null;
        }
      }),
    } as unknown as ConfigService;

    const mailConfig = new MailConfig(configService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailConfig, useValue: mailConfig },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send an email', async () => {
    const to = 'to@example.com';
    const subject = 'Test Subject';
    const text = 'Test Text';

    await service.sendMail(to, subject, text);

    expect(transporterMock.sendMail).toHaveBeenCalledWith({
      from: 'from@example.com',
      to,
      subject,
      text,
    });

    expect(loggerService.log).toHaveBeenCalledWith(
      `Email sent to ${to} with subject: ${subject}`,
    );
    expect(loggerService.error).not.toHaveBeenCalled();
  });

  it('should log an error if sending email fails', async () => {
    const to = 'to@example.com';
    const subject = 'Test Subject';
    const text = 'Test Text';

    const error = new Error('Failed to send email');
    transporterMock.sendMail.mockRejectedValue(error);

    await expect(service.sendMail(to, subject, text)).rejects.toThrow(error);

    expect(loggerService.error).toHaveBeenCalledWith(error.stack);
    expect(loggerService.log).not.toHaveBeenCalled();
  });
});
