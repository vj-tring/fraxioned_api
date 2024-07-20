import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from '@mail/mail.service';
import { ContactUsDTO } from './contact-us.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@user/entities/user.entity';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ContactUsService {
  constructor(
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly loggerService: LoggerService,
  ) {}

  async handleContactUs(contactUsDTO: ContactUsDTO) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: contactUsDTO.userId },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const email = user.email;

      const text = `Name: ${contactUsDTO.name}\nEmail: ${email}\nMessage: ${contactUsDTO.message}`;

      await this.mailService.sendMail(
        'johnson.selvakumar@tringapps.net',
        contactUsDTO.subject,
        text,
      );

      this.loggerService.log('Contact message sent successfully');

      return { message: 'Contact message sent successfully' };
    } catch (error) {
      this.loggerService.error(error.stack);
      throw error;
    }
  }
}
