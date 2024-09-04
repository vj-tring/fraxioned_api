import { MailerService } from '@nestjs-modules/mailer';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CONTACT_US_RESPONSES } from 'src/main/commons/constants/response-constants/contact-us.constant';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { ContactUsController } from 'src/main/controller/contact-us.controller';
import { ContactUsDto } from 'src/main/dto/requests/contact-us.dto';
import { MailService } from 'src/main/email/mail.service';
import { ContactUs } from 'src/main/entities/contact-us.entity';
import { Property } from 'src/main/entities/property.entity';
import { Role } from 'src/main/entities/role.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { UserSession } from 'src/main/entities/user-session.entity';
import { User } from 'src/main/entities/user.entity';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { ContactUsService } from 'src/main/service/contact-us.service';
import { LoggerService } from 'src/main/service/logger.service';
import { Repository } from 'typeorm';

describe('MaintenanceService', () => {
  let service: ContactUsService;
  let controller: ContactUsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactUsController],
      providers: [
        AuthenticationService,
        ContactUsService,
        MailService,
        {
          provide: getRepositoryToken(ContactUs),
          useClass: Repository,
        },
        LoggerService,
        {
          provide: MailerService,
          useValue: { sendMail: jest.fn() },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserContactDetails),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserSession),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserProperties),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        AuthGuard,
      ],
    }).compile();

    service = module.get<ContactUsService>(ContactUsService);
    controller = module.get<ContactUsController>(ContactUsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('contactUs', () => {
    it('should sent a mail successfully to admins and owners', async () => {
      const mockContactUsDto: ContactUsDto = {
        subject: 'Test Subject',
        comments: 'Test Comments',
        senderId: 1,
      };

      jest
        .spyOn(service, 'contactUs')
        .mockResolvedValue(CONTACT_US_RESPONSES.ENQUIRY_SUCCESS());

      const result = await controller.contactUs(mockContactUsDto);

      expect(result).toBeDefined();
      expect(result).toEqual(CONTACT_US_RESPONSES.ENQUIRY_SUCCESS());
      expect(service.contactUs).toHaveBeenCalled();
    });

    it('should throw Error when service throws Error', async () => {
      const mockContactUsDto: ContactUsDto = {
        subject: 'Test Subject',
        comments: 'Test Comments',
        senderId: 1,
      };

      jest
        .spyOn(service, 'contactUs')
        .mockRejectedValue(new Error('Save Failed'));

      await expect(controller.contactUs(mockContactUsDto)).resolves.toEqual(
        new Error('Save Failed'),
      );

      expect(service.contactUs).toHaveBeenCalled();
    });
  });
});
