import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

interface MailConfig {
  transport: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  defaults: {
    from: string;
    to: string;
  };
  template: {
    dir: string;
    adapter: HandlebarsAdapter;
    options: {
      strict: boolean;
    };
  };
}

export const mailConfigAsync = {
  useFactory: async (configService: ConfigService): Promise<MailConfig> => {
    const mailHost = configService.get<string>('MAIL_HOST');
    const mailUser = configService.get<string>('MAIL_USER');
    const mailPassword = configService.get<string>('MAIL_PASSWORD');
    const mailFrom = configService.get<string>('MAIL_FROM');
    const mailPort = configService.get<number>('MAIL_PORT');

    if (!mailHost || !mailUser || !mailPassword || !mailFrom || !mailPort) {
      throw new Error('Missing required email configuration values.');
    }

    const templateDir = join('src/main/email', 'templates');

    console.log('Template Directory:', templateDir);

    return {
      transport: {
        host: mailHost,
        port: mailPort,
        secure: false,
        auth: {
          user: mailUser,
          pass: mailPassword,
        },
      },
      defaults: {
        from: `"No Reply" <${mailFrom}>`,
        to: `"No Reply" <${mailFrom}>`,
      },
      template: {
        dir: templateDir,
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  },
  inject: [ConfigService],
};
