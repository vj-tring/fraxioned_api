import { MailerService } from '@nestjs-modules/mailer';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mailSubject,
  mailTemplates,
} from 'src/main/commons/constants/email/mail.constants';
import { MAINTENANCE_RESPONSES } from 'src/main/commons/constants/response-constants/maintenance.constant';
import { MaintenanceTicketDto } from 'src/main/dto/requests/maintenance-ticket.dto';
import { MailService } from 'src/main/email/mail.service';
import { MaintenanceTicket } from 'src/main/entities/maintenance-ticket.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import { LoggerService } from 'src/main/service/logger.service';
import { MaintenanceService } from 'src/main/service/maintenance.service';
import { Repository } from 'typeorm';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let userRepository: Repository<User>;
  let userContactDetailsRepository: Repository<UserContactDetails>;
  let maintenanceTicketRepository: Repository<MaintenanceTicket>;
  let mailService: MailService;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        MailService,
        LoggerService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserContactDetails),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(MaintenanceTicket),
          useClass: Repository,
        },
        {
          provide: MailerService,
          useValue: { sendMail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userContactDetailsRepository = module.get<Repository<UserContactDetails>>(
      getRepositoryToken(UserContactDetails),
    );
    maintenanceTicketRepository = module.get<Repository<MaintenanceTicket>>(
      getRepositoryToken(MaintenanceTicket),
    );
    mailService = module.get<MailService>(MailService);
    logger = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('maintenanceTicket', () => {
    it('should send the mail successfully', async () => {
      const mockMaintenanceTicketDto: MaintenanceTicketDto = {
        ticketSubject: 'Test Ticket',
        ticketDescription: 'Test Description',
        senderId: 1,
      };

      const mockUser = new User();
      mockUser.firstName = 'John';
      mockUser.lastName = 'Doe';
      mockUser.isActive = true;
      const mockUserContactDetails: UserContactDetails = {
        contactValue: 'user@example.com',
        contactType: 'email',
        user: mockUser,
      } as UserContactDetails;

      const mockAdmins: User[] = [
        {
          id: 2,
          contactDetails: [
            { contactValue: 'admin1@example.com', contactType: 'email' },
          ],
        } as User,
        {
          id: 3,
          contactDetails: [
            { contactValue: 'admin2@example.com', contactType: 'email' },
          ],
        } as User,
      ];

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(userContactDetailsRepository, 'find')
        .mockResolvedValue([mockUserContactDetails]);
      jest.spyOn(userRepository, 'find').mockResolvedValue(mockAdmins);
      jest.spyOn(mailService, 'sendMail').mockResolvedValue(undefined);
      jest
        .spyOn(mailService, 'sendMailWithCarbonCopy')
        .mockResolvedValue(undefined);
      jest
        .spyOn(maintenanceTicketRepository, 'save')
        .mockResolvedValue(new MaintenanceTicket());

      const result = await service.maintenanceTicket(mockMaintenanceTicketDto);

      expect(result).toBeDefined();
      expect(result).toEqual(MAINTENANCE_RESPONSES.TICKET_SUCCESS());
      expect(mailService.sendMail).toHaveBeenCalledWith(
        'user@example.com',
        mailSubject.maintenance.default,
        mailTemplates.maintenance.default,
        { name: 'John Doe' },
      );
      expect(mailService.sendMailWithCarbonCopy).toHaveBeenCalledWith(
        [
          'admin1@example.com',
          'admin2@example.com',
          'admin1@example.com',
          'admin2@example.com',
        ],
        mailSubject.maintenance.ticket,
        mailTemplates.maintenance.ticket,
        {
          name: 'John Doe',
          title: 'Test Ticket',
          description: 'Test Description',
        },
      );
    });

    it('should return USER_ACCOUNT_INVALID when user does not exist', async () => {
      const mockMaintenanceTicketDto: MaintenanceTicketDto = {
        ticketSubject: 'Test Ticket',
        ticketDescription: 'Test Description',
        senderId: 1,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.maintenanceTicket(mockMaintenanceTicketDto);

      expect(result).toEqual(MAINTENANCE_RESPONSES.USER_ACCOUNT_INVALID());
    });

    it('should return USER_ACCOUNT_STATUS when user is inactive', async () => {
      const mockMaintenanceTicketDto: MaintenanceTicketDto = {
        ticketSubject: 'Test Ticket',
        ticketDescription: 'Test Description',
        senderId: 1,
      };

      const mockUser = new User();
      mockUser.isActive = false;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.maintenanceTicket(mockMaintenanceTicketDto);

      expect(result).toEqual(MAINTENANCE_RESPONSES.USER_ACCOUNT_STATUS());
    });

    it('should return USER_ACCOUNT_EMAIL when no email is found for user', async () => {
      const mockMaintenanceTicketDto: MaintenanceTicketDto = {
        ticketSubject: 'Test Ticket',
        ticketDescription: 'Test Description',
        senderId: 1,
      };

      const mockUser = new User();
      mockUser.isActive = true;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userContactDetailsRepository, 'find').mockResolvedValue([]);

      const result = await service.maintenanceTicket(mockMaintenanceTicketDto);

      expect(result).toEqual(MAINTENANCE_RESPONSES.USER_ACCOUNT_EMAIL());
    });

    it('should handle errors and log them', async () => {
      const mockMaintenanceTicketDto: MaintenanceTicketDto = {
        ticketSubject: 'Test Ticket',
        ticketDescription: 'Test Description',
        senderId: 1,
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));
      const loggerLogSpy = jest
        .spyOn(logger, 'log')
        .mockImplementation(() => {});

      const result = await service.maintenanceTicket(mockMaintenanceTicketDto);

      expect(result).toEqual(expect.any(Error));
      expect(loggerLogSpy).toHaveBeenCalledWith(
        'Error occured while raising the maintenance ticket : Database error',
      );
    });
  });
});
