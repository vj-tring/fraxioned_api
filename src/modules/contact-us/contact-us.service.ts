import { Injectable, NotFoundException } from '@nestjs/common';
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
      const user = await this.userRepository.findOne({ where: { id: contactUsDTO.userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const email = user.email;
  
      const text = `Name: ${contactUsDTO.name}\nEmail: ${email}\nMessage: ${contactUsDTO.message}`;
  
      await this.mailService.sendMail(
        'johnson.selvakumar@tringapps.net',
        contactUsDTO.subject,
        text,
      );
  
      return { message: 'Contact message sent successfully' };
    }
}