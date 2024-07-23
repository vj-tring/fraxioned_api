// import { Test, TestingModule } from '@nestjs/testing';
// import { MailService } from '@mail/mail.service';
// import { MailConfig } from '@mail/mail.config';
// import * as nodemailer from 'nodemailer';
// import { LoggerService } from '@logger/logger.service';

// jest.mock('nodemailer');

// describe('MailService', () => {
//   let service: MailService;
//   let transporterMock: any;
//   let loggerService: LoggerService;

//   beforeEach(async () => {
//     transporterMock = {
//       sendMail: jest.fn().mockResolvedValue({}),
//     };

//     nodemailer.createTransport.mockReturnValue(transporterMock);

//     const mailConfig: MailConfig = {
//       SMTP_HOST: 'smtp.example.com',
//       SMTP_PORT: 587,
//       SMTP_USERNAME: 'user@example.com',
//       SMTP_PASSWORD: 'password',
//       FROM_EMAIL: 'from@example.com',
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         MailService,
//         { provide: MailConfig, useValue: mailConfig },
//         {
//           provide: LoggerService,
//           useValue: {
//             log: jest.fn(),
//             error: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<MailService>(MailService);
//     loggerService = module.get<LoggerService>(LoggerService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   it('should send an email', async () => {
//     const to = 'to@example.com';
//     const subject = 'Test Subject';
//     const text = 'Test Text';

//     await service.sendMail(to, subject, text);

//     expect(transporterMock.sendMail).toHaveBeenCalledWith({
//       from: 'from@example.com',
//       to,
//       subject,
//       text,
//     });

//     expect(loggerService.log).toHaveBeenCalledWith(
//       `Email sent to ${to} with subject: ${subject}`,
//     );
//     expect(loggerService.error).not.toHaveBeenCalled();
//   });

//   it('should log an error if sending email fails', async () => {
//     const to = 'to@example.com';
//     const subject = 'Test Subject';
//     const text = 'Test Text';

//     const error = new Error('Failed to send email');
//     transporterMock.sendMail.mockRejectedValue(error);

//     await expect(service.sendMail(to, subject, text)).rejects.toThrow(error);

//     expect(loggerService.error).toHaveBeenCalledWith(error.stack);
//     expect(loggerService.log).not.toHaveBeenCalled();
//   });
// });
