import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { ContactUsDTO } from './contact-us.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class ContactUsService {
  constructor(private readonly mailService: MailService) {}

  @InjectRepository(User)
    private readonly userRepository: Repository<User>
    
    async handleContactUs(contactUsDTO: ContactUsDTO) {
      const { name, subject, message } = contactUsDTO;
      const user = await this.userRepository.findOne({where: { id: contactUsDTO.userId },});
      const email = user.email;

      const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;

      await this.mailService.sendMailFromUser(
        email,
        'johnson.selvakumar@tringapps.net',
        subject,
        text,
      );

    return { message: 'Contact message sent successfully' };
  }
}