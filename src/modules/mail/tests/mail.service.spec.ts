import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail.service';
import { MailConfig } from '../mail.config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let transporterMock: any;

  beforeEach(async () => {
    transporterMock = {
      sendMail: jest.fn().mockResolvedValue({}),
    };

    nodemailer.createTransport.mockReturnValue(transporterMock);

    const mailConfig: MailConfig = {
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: 587,
      SMTP_USERNAME: 'user@example.com',
      SMTP_PASSWORD: 'password',
      FROM_EMAIL: 'from@example.com',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailConfig, useValue: mailConfig },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
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
  });
});
