import { Injectable } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { MailService } from '../email/mail.service';
import { UserContactDetails } from '../entities/user-contact-details.entity';
import {
  mailSubject,
  mailTemplates,
} from '../commons/constants/email/mail.constants';
import { LoggerService } from './logger.service';
import { ContactUs } from '../entities/contact-us.entity';
import { ContactUsDto } from '../dto/requests/contact-us.dto';
import { ContactUsResponseDto } from '../dto/responses/contact-us.dto';
import { CONTACT_US_RESPONSES } from '../commons/constants/response-constants/contact-us.constant';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserContactDetails)
    private readonly userContactDetailsRepository: Repository<UserContactDetails>,
    private mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async contactUs(contactUsDto: ContactUsDto): Promise<ContactUsResponseDto> {
    try {
      const userId: number = contactUsDto.senderId;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return CONTACT_US_RESPONSES.USER_ACCOUNT_INVALID();
      }

      if (!user.isActive) {
        return CONTACT_US_RESPONSES.USER_ACCOUNT_STATUS();
      }

      const contacts = await this.userContactDetailsRepository.find({
        where: {
          user: {
            id: userId,
          },
        },
        select: ['primaryEmail'],
      });

      if (contacts.length === 0) {
        return CONTACT_US_RESPONSES.USER_ACCOUNT_EMAIL();
      }

      const { primaryEmail: email } = contacts[0];

      if (!email) {
        return CONTACT_US_RESPONSES.USER_ACCOUNT_EMAIL();
      }

      const adminMail = await this.userRepository.find({
        relations: ['role'],
        where: { role: { id: 1 }, id: MoreThan(1) },
      });

      const listOfEmails = await Promise.all(
        adminMail.map(async (admin) => {
          const user = await this.userRepository.find({
            relations: ['contactDetails'],
            where: { id: admin.id },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              contactDetails: {
                primaryEmail: true,
              },
            },
          });

          const emails = user.flatMap(
            (user) => user.contactDetails.primaryEmail,
          );

          return emails;
        }),
      );

      if (!listOfEmails) {
        return CONTACT_US_RESPONSES.USER_ACCOUNT_ADMIN_EMAIL();
      }

      const contactUs = new ContactUs();
      contactUs.subject = contactUsDto.subject;
      contactUs.comments = contactUsDto.comments;
      contactUs.createdBy.id = contactUsDto.senderId;

      await this.contactUsRepository.save(contactUs);
      this.logger.log(`Enquiry have been saved successfully`);

      const name = user.firstName + ' ' + user.lastName;
      const subject = mailSubject.contactUs.default;
      const template = mailTemplates.contactUs.default;
      const context = { name };

      await this.mailService.sendMail(email, subject, template, context);
      await this.mailService.sendMailWithCarbonCopy(
        listOfEmails.flat(),
        mailSubject.contactUs.enquiry,
        mailTemplates.contactUs.enquiry,
        {
          name,
          subject: contactUsDto.subject,
          comments: contactUsDto.comments,
        },
      );

      this.logger.log(`Enquiry has been received from the mail : ${email}`);

      return CONTACT_US_RESPONSES.ENQUIRY_SUCCESS();
    } catch (error) {
      this.logger.log(
        `Error occured while sending the owners queries : ${error.message}`,
      );
      return error;
    }
  }
}
