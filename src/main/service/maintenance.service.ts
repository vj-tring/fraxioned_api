import { Injectable } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { MaintenanceTicketDto } from '../dto/requests/maintenance-ticket.dto';
import { MaintenanceTicket } from '../entities/maintenance-ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { MailService } from '../email/mail.service';
import { UserContactDetails } from '../entities/user-contact-details.entity';
import { MAINTENANCE_RESPONSES } from '../commons/constants/response-constants/maintenance.constant';
import {
  mailSubject,
  mailTemplates,
} from '../commons/constants/email/mail.constants';
import { LoggerService } from './logger.service';
import { MaintenanceTicketResponseDto } from '../dto/responses/maintenance-ticket.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceTicket)
    private readonly maintenanceTicketRepository: Repository<MaintenanceTicket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserContactDetails)
    private readonly userContactDetailsRepository: Repository<UserContactDetails>,
    private mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async maintenanceTicket(
    maintenanceTicketDto: MaintenanceTicketDto,
  ): Promise<MaintenanceTicketResponseDto> {
    try {
      const userId: number = maintenanceTicketDto.senderId;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return MAINTENANCE_RESPONSES.USER_ACCOUNT_INVALID();
      }

      if (!user.isActive) {
        return MAINTENANCE_RESPONSES.USER_ACCOUNT_STATUS();
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
        return MAINTENANCE_RESPONSES.USER_ACCOUNT_EMAIL();
      }

      const { primaryEmail: email } = contacts[0];

      if (!email) {
        return MAINTENANCE_RESPONSES.USER_ACCOUNT_EMAIL();
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
        return MAINTENANCE_RESPONSES.USER_ACCOUNT_ADMIN_EMAIL();
      }

      //   console.log(listOfEmails);

      //   const adminMailArray = await Promise.all(
      //     adminMail.map(async (mail) => {
      //       const userDetails = await this.userContactDetailsRepository.find({
      //         relations: ['user'],
      //         where: { user: { id: mail.id }, contactType: 'email' },
      //         select: ['contactValue'],
      //       });
      //       console.log(userDetails);
      //       return userDetails;
      //     }),
      //   );

      const maintenanceTicket = new MaintenanceTicket();
      maintenanceTicket.ticketSubject = maintenanceTicketDto.ticketSubject;
      maintenanceTicket.ticketDescription =
        maintenanceTicketDto.ticketDescription;
      maintenanceTicket.createdBy = maintenanceTicketDto.senderId;

      await this.maintenanceTicketRepository.save(maintenanceTicket);
      this.logger.log(`Maintenance Ticket have been saved successfully`);

      const name = user.firstName + ' ' + user.lastName;
      const subject = mailSubject.maintenance.default;
      const template = mailTemplates.maintenance.default;
      const context = { name };

      await this.mailService.sendMail(email, subject, template, context);
      await this.mailService.sendMailWithCarbonCopy(
        listOfEmails.flat(),
        mailSubject.maintenance.ticket,
        mailTemplates.maintenance.ticket,
        {
          name,
          title: maintenanceTicketDto.ticketSubject,
          description: maintenanceTicketDto.ticketDescription,
        },
      );

      this.logger.log(`Ticket has been raised from the mail : ${email}`);

      return MAINTENANCE_RESPONSES.TICKET_SUCCESS();
    } catch (error) {
      this.logger.log(
        `Error occured while raising the maintenance ticket : ${error.message}`,
      );
      return error;
    }
  }
}
