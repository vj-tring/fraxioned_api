import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { assetsHostingUrl } from '../commons/constants/email/mail.constants';

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
    const partialsDir = join('src/main/email', 'templates', 'partials');
    const cssPath = join('src/main/email', 'templates', 'style.css');
    let baseUrl = `${assetsHostingUrl.production}`;

    if (configService.get('SET_ENV') === 'DEV') {
      baseUrl = `${assetsHostingUrl.development}`;
    }

    console.log('Template Directory:', templateDir);
    console.log('Partial Template Directory:', partialsDir);
    console.log('Base URL:', baseUrl);

    const cssContent = fs.readFileSync(cssPath, 'utf8');

    handlebars.registerHelper('css', () => `<style>${cssContent}</style>`);
    handlebars.registerHelper('constructUrl', (path) => `${baseUrl}${path}`);

    const partialFiles = fs.readdirSync(partialsDir);
    partialFiles.forEach((file) => {
      const partialName = file.split('.')[0];
      const partialPath = join(partialsDir, file);
      const partialContent = fs.readFileSync(partialPath, 'utf8');
      handlebars.registerPartial(partialName, partialContent);
    });

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
