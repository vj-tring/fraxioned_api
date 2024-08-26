import { ConfigService } from '@nestjs/config';
import { mailConfigAsync } from 'src/main/config/mail.config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

describe('mailConfigAsync', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  it('should return the correct mail configuration', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'MAIL_HOST':
          return 'smtp.example.com';
        case 'MAIL_USER':
          return 'user@example.com';
        case 'MAIL_PASSWORD':
          return 'password';
        case 'MAIL_FROM':
          return 'no-reply@example.com';
        case 'MAIL_PORT':
          return 587;
        default:
          return null;
      }
    });

    const config = await mailConfigAsync.useFactory(configService);

    expect(config).toEqual({
      transport: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'user@example.com',
          pass: 'password',
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@example.com>',
        to: '"No Reply" <no-reply@example.com>',
      },
      template: {
        dir: join('src/main/email', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    });
  });

  it('should throw an error if MAIL_HOST is missing', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'MAIL_USER':
          return 'user@example.com';
        case 'MAIL_PASSWORD':
          return 'password';
        case 'MAIL_FROM':
          return 'no-reply@example.com';
        case 'MAIL_PORT':
          return 587;
        default:
          return null;
      }
    });

    await expect(mailConfigAsync.useFactory(configService)).rejects.toThrow(
      'Missing required email configuration values.',
    );
  });

  it('should throw an error if MAIL_USER is missing', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'MAIL_HOST':
          return 'smtp.example.com';
        case 'MAIL_PASSWORD':
          return 'password';
        case 'MAIL_FROM':
          return 'no-reply@example.com';
        case 'MAIL_PORT':
          return 587;
        default:
          return null;
      }
    });

    await expect(mailConfigAsync.useFactory(configService)).rejects.toThrow(
      'Missing required email configuration values.',
    );
  });

  it('should throw an error if MAIL_PASSWORD is missing', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'MAIL_HOST':
          return 'smtp.example.com';
        case 'MAIL_USER':
          return 'user@example.com';
        case 'MAIL_FROM':
          return 'no-reply@example.com';
        case 'MAIL_PORT':
          return 587;
        default:
          return null;
      }
    });

    await expect(mailConfigAsync.useFactory(configService)).rejects.toThrow(
      'Missing required email configuration values.',
    );
  });

  it('should throw an error if MAIL_FROM is missing', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'MAIL_HOST':
          return 'smtp.example.com';
        case 'MAIL_USER':
          return 'user@example.com';
        case 'MAIL_PASSWORD':
          return 'password';
        case 'MAIL_PORT':
          return 587;
        default:
          return null;
      }
    });

    await expect(mailConfigAsync.useFactory(configService)).rejects.toThrow(
      'Missing required email configuration values.',
    );
  });

  it('should throw an error if MAIL_PORT is missing', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'MAIL_HOST':
          return 'smtp.example.com';
        case 'MAIL_USER':
          return 'user@example.com';
        case 'MAIL_PASSWORD':
          return 'password';
        case 'MAIL_FROM':
          return 'no-reply@example.com';
        default:
          return null;
      }
    });

    await expect(mailConfigAsync.useFactory(configService)).rejects.toThrow(
      'Missing required email configuration values.',
    );
  });
});
