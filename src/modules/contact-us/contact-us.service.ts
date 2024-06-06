import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { ContactUsDTO } from './contact-us.dto';

@Injectable()
export class ContactUsService {
  constructor(private readonly mailService: MailService) {}

  async handleContactUs(contactUsDTO: ContactUsDTO) {
    const { name, email, message } = contactUsDTO;
    const subject = 'New Contact Us Message';
    const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;

    // Send an email with the contact message
    await this.mailService.sendMail('johnson.selvakumar@tringapps.net', subject, text);
    return { message: 'Contact message sent successfully' };
  }
}
