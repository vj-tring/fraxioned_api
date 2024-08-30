import { MailerService } from '@nestjs-modules/mailer';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mailSubject,
  mailTemplates,
} from 'src/main/commons/constants/email/mail.constants';
import { CONTACT_US_RESPONSES } from 'src/main/commons/constants/response-constants/contact-us.constant';
import { ContactUsDto } from 'src/main/dto/requests/contact-us.dto';
import { MailService } from 'src/main/email/mail.service';
import { ContactUs } from 'src/main/entities/contact-us.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import { ContactUsService } from 'src/main/service/contact-us.service';
import { LoggerService } from 'src/main/service/logger.service';
import { Repository } from 'typeorm';

describe('MaintenanceService', () => {
  let service: ContactUsService;
  let userRepository: Repository<User>;
  let userContactDetailsRepository: Repository<UserContactDetails>;
  let contactUsRepository: Repository<ContactUs>;
  let mailService: MailService;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactUsService,
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
          provide: getRepositoryToken(ContactUs),
          useClass: Repository,
        },
        {
          provide: MailerService,
          useValue: { sendMail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ContactUsService>(ContactUsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userContactDetailsRepository = module.get<Repository<UserContactDetails>>(
      getRepositoryToken(UserContactDetails),
    );
    contactUsRepository = module.get<Repository<ContactUs>>(
      getRepositoryToken(ContactUs),
    );
    mailService = module.get<MailService>(MailService);
    logger = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('contactUs', () => {
    it('should send the enquiry mail successfully', async () => {
      const mockContactUsDto: ContactUsDto = {
        subject: 'Test Subject',
        comments: 'Test Comments',
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
        .spyOn(contactUsRepository, 'save')
        .mockResolvedValue(new ContactUs());

      const result = await service.contactUs(mockContactUsDto);

      expect(result).toBeDefined();
      expect(result).toEqual(CONTACT_US_RESPONSES.ENQUIRY_SUCCESS());
      expect(mailService.sendMail).toHaveBeenCalledWith(
        'user@example.com',
        mailSubject.contactUs.default,
        mailTemplates.contactUs.default,
        { name: 'John Doe' },
      );
      expect(mailService.sendMailWithCarbonCopy).toHaveBeenCalledWith(
        [
          'admin1@example.com',
          'admin2@example.com',
          'admin1@example.com',
          'admin2@example.com',
        ],
        mailSubject.contactUs.enquiry,
        mailTemplates.contactUs.enquiry,
        {
          name: 'John Doe',
          subject: 'Test Subject',
          comments: 'Test Comments',
        },
      );
    });

    it('should return USER_ACCOUNT_INVALID when user does not exist', async () => {
      const mockContactUsDto: ContactUsDto = {
        subject: 'Test Subject',
        comments: 'Test Comments',
        senderId: 1,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.contactUs(mockContactUsDto);

      expect(result).toEqual(CONTACT_US_RESPONSES.USER_ACCOUNT_INVALID());
    });

    it('should return USER_ACCOUNT_STATUS when user is inactive', async () => {
      const mockContactUsDto: ContactUsDto = {
        subject: 'Test Subject',
        comments: 'Test Comments',
        senderId: 1,
      };

      const mockUser = new User();
      mockUser.isActive = false;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.contactUs(mockContactUsDto);

      expect(result).toEqual(CONTACT_US_RESPONSES.USER_ACCOUNT_STATUS());
    });

    it('should return USER_ACCOUNT_EMAIL when no email is found for user', async () => {
      const mockContactUsDto: ContactUsDto = {
        subject: 'Test Subject',
        comments: 'Test Comments',
        senderId: 1,
      };

      const mockUser = new User();
      mockUser.isActive = true;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userContactDetailsRepository, 'find').mockResolvedValue([]);

      const result = await service.contactUs(mockContactUsDto);

      expect(result).toEqual(CONTACT_US_RESPONSES.USER_ACCOUNT_EMAIL());
    });

    it('should handle errors and log them', async () => {
      const mockContactUsDto: ContactUsDto = {
        subject: 'Test Subject',
        comments: 'Test Comments',
        senderId: 1,
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));
      const loggerLogSpy = jest
        .spyOn(logger, 'log')
        .mockImplementation(() => {});

      const result = await service.contactUs(mockContactUsDto);

      expect(result).toEqual(expect.any(Error));
      expect(loggerLogSpy).toHaveBeenCalledWith(
        'Error occured while sending the owners queries : Database error',
      );
    });
  });
});
