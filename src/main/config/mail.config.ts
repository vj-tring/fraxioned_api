/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailConfigAsync = {
  useFactory: async (configService: ConfigService) => {
    const mailHost = configService.get('MAIL_HOST');
    const mailUser = configService.get('MAIL_USER');
    const mailPassword = configService.get('MAIL_PASSWORD');
    const mailFrom = configService.get('MAIL_FROM');
    const mailPort = configService.get('MAIL_PORT');

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
