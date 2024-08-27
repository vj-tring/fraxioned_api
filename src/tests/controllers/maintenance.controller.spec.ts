import { MailerService } from '@nestjs-modules/mailer';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MAINTENANCE_RESPONSES } from 'src/main/commons/constants/response-constants/maintenance.constant';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { MaintenanceController } from 'src/main/controller/maintenance.controller';
import { MaintenanceTicketDto } from 'src/main/dto/requests/maintenance-ticket.dto';
import { MailService } from 'src/main/email/mail.service';
import { MaintenanceTicket } from 'src/main/entities/maintenance-ticket.entity';
import { Property } from 'src/main/entities/property.entity';
import { Role } from 'src/main/entities/role.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { UserSession } from 'src/main/entities/user-session.entity';
import { User } from 'src/main/entities/user.entity';
import { AuthenticationService } from 'src/main/service/authentication.service';
import { LoggerService } from 'src/main/service/logger.service';
import { MaintenanceService } from 'src/main/service/maintenance.service';
import { Repository } from 'typeorm';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let controller: MaintenanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [
        AuthenticationService,
        MaintenanceService,
        MailService,
        {
          provide: getRepositoryToken(MaintenanceTicket),
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

    service = module.get<MaintenanceService>(MaintenanceService);
    controller = module.get<MaintenanceController>(MaintenanceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('maintenanceTicket', () => {
    it('should sent a mail successfully to admins and owners', async () => {
      const mockMaintenanceTicketDto: MaintenanceTicketDto = {
        ticketSubject: 'Test Ticket',
        ticketDescription: 'Test Description',
        senderId: 1,
      };

      jest
        .spyOn(service, 'maintenanceTicket')
        .mockResolvedValue(MAINTENANCE_RESPONSES.TICKET_SUCCESS());

      const result = await controller.maintenanceTicket(
        mockMaintenanceTicketDto,
      );

      expect(result).toBeDefined();
      expect(result).toEqual(MAINTENANCE_RESPONSES.TICKET_SUCCESS());
      expect(service.maintenanceTicket).toHaveBeenCalled();
    });

    it('should throw Error when service throws Error', async () => {
      const mockMaintenanceTicketDto: MaintenanceTicketDto = {
        ticketSubject: 'Test Ticket',
        ticketDescription: 'Test Description',
        senderId: 1,
      };

      jest
        .spyOn(service, 'maintenanceTicket')
        .mockRejectedValue(new Error('Save Failed'));

      await expect(
        controller.maintenanceTicket(mockMaintenanceTicketDto),
      ).resolves.toEqual(new Error('Save Failed'));

      expect(service.maintenanceTicket).toHaveBeenCalled();
    });
  });
});
