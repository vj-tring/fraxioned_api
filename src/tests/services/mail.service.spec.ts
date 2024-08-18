import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from 'src/main/email/mail.service';

describe('MailService', () => {
  let mailService: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const mailerServiceMock = {
      sendMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mailerServiceMock },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMail', () => {
    it('should call mailerService.sendMail with the correct parameters', async () => {
      const email = 'test@example.com';
      const subject = 'Test Subject';
      const template = 'test-template';
      const context = { key: 'value' };

      await mailService.sendMail(email, subject, template, context);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: subject,
        template: template,
        context: {
          ...context,
        },
      });
    });

    it('should handle errors thrown by mailerService.sendMail', async () => {
      (mailerService.sendMail as jest.Mock).mockRejectedValue(
        new Error('Send mail failed'),
      );

      const email = 'test@example.com';
      const subject = 'Test Subject';
      const template = 'test-template';
      const context = { key: 'value' };

      await expect(
        mailService.sendMail(email, subject, template, context),
      ).rejects.toThrow('Send mail failed');
    });
  });
});
