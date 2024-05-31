export class MailConfig {
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USERNAME: string;
    SMTP_PASSWORD: string;
    FROM_EMAIL: string;
  
    constructor() {
      this.SMTP_HOST = 'smtp.gmail.com';
      this.SMTP_PORT = 587;
      this.SMTP_USERNAME = 'johnson.selvakumar@tringapps.net';
      this.SMTP_PASSWORD = 'grge xsdo rfqc ymps';
      this.FROM_EMAIL = 'johnson.selvakumar@tringapps.net';
    }
  }