import { Test, TestingModule } from '@nestjs/testing';
import { InviteService } from '../../main/service/auth/invite.service';
import { LoggerService } from '../../main/service/logger.service';
import { InviteUserDto } from 'src/main/dto/requests/auth/inviteUser.dto';
import { Repository } from 'typeorm';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/main/entities/role.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { MailService } from 'src/main/email/mail.service';
import { INVITE_USER_RESPONSES } from 'src/main/commons/constants/response-constants/auth.constant';
import { ROLE_RESPONSES } from 'src/main/commons/constants/response-constants/role.constant';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.constant';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.constant';

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

jest.mock('services/logger.service');
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('InviteService', () => {
  let service: InviteService;
  let userRepository: MockRepository<User>;
  let userContactDetailsRepository: MockRepository<UserContactDetails>;
  let userPropertyRepository: MockRepository<UserProperties>;
  let roleRepository: MockRepository<Role>;
  let propertyRepository: MockRepository<Property>;
  let propertyDetailsRepository: MockRepository<PropertyDetails>;
  let logger: LoggerService;

  beforeEach(async () => {
    userRepository = createMockRepository();
    userContactDetailsRepository = createMockRepository();
    userPropertyRepository = createMockRepository();
    roleRepository = createMockRepository();
    propertyRepository = createMockRepository();
    propertyDetailsRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: getRepositoryToken(UserContactDetails),
          useValue: userContactDetailsRepository,
        },
        {
          provide: getRepositoryToken(UserProperties),
          useValue: userPropertyRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepository,
        },
        {
          provide: getRepositoryToken(Property),
          useValue: propertyRepository,
        },
        {
          provide: getRepositoryToken(PropertyDetails),
          useValue: propertyDetailsRepository,
        },
        { provide: MailService, useValue: { sendMail: jest.fn() } },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    logger = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('inviteUser', () => {
    const inviteUserDto: InviteUserDto = {
      email: 'johnson.selvakumar@tringapps.net',
      firstName: 'Johnson',
      lastName: 'Melvin',
      addressLine1: 'A1/12',
      addressLine2: 'K.K.Nagar',
      state: 'TN',
      country: 'IND',
      city: 'CH',
      zipcode: '600000',
      phoneNumber: '9823928382',
      roleId: 1,
      updatedBy: 1,
      createdBy: 1,
      userPropertyDetails: [
        {
          propertyID: 5,
          noOfShares: 3,
          acquisitionDate: new Date('2022-08-19T11:29:55.366Z'),
        },
      ],
    };

    it('should invite user successfully', async () => {
      const createdByUser = { id: 1 };
      const updatedByUser = { id: 1 };
      const role = { id: 1 };
      const property = { id: 5 };
      const propertyDetails = {
        id: 5,
        peakSeasonAllottedNights: 10,
        offSeasonAllottedNights: 5,
        peakSeasonAllottedHolidayNights: 3,
        offSeasonAllottedHolidayNights: 2,
      };

      userContactDetailsRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValueOnce(createdByUser);
      userRepository.findOne.mockResolvedValueOnce(updatedByUser);
      roleRepository.findOne.mockResolvedValue(role);
      propertyRepository.findOne.mockResolvedValue(property);
      propertyDetailsRepository.findOne.mockResolvedValue(propertyDetails);
      userRepository.create.mockReturnValue({ id: 1 });
      userRepository.save.mockResolvedValue({ id: 1 });
      userContactDetailsRepository.create.mockReturnValue({});
      userContactDetailsRepository.save.mockResolvedValue({});
      userPropertyRepository.create.mockReturnValue({});
      userPropertyRepository.save.mockResolvedValue({});

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual(INVITE_USER_RESPONSES.INVITE_SUCCESS);
      expect(logger.log).toHaveBeenCalledWith(
        `Inviting user with email: ${inviteUserDto.email}`,
      );
      expect(logger.log).toHaveBeenCalledWith(
        `Invite sent successfully to ${inviteUserDto.email}`,
      );
    });

    it('should return EMAIL_EXISTS if email already exists', async () => {
      userContactDetailsRepository.findOne.mockResolvedValue({});

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual(INVITE_USER_RESPONSES.EMAIL_EXISTS);
      expect(logger.error).toHaveBeenCalledWith(
        `Email already exists: ${inviteUserDto.email}`,
      );
    });

    it('should return USER_NOT_FOUND if createdBy user is not found', async () => {
      userContactDetailsRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual(
        USER_RESPONSES.USER_NOT_FOUND(inviteUserDto.createdBy),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `CreatedBy user not found with ID: ${inviteUserDto.createdBy}`,
      );
    });

    it('should return USER_NOT_FOUND if updatedBy user is not found', async () => {
      userContactDetailsRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValueOnce({ id: 1 });
      userRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual(
        USER_RESPONSES.USER_NOT_FOUND(inviteUserDto.updatedBy),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `UpdatedBy user not found with ID: ${inviteUserDto.updatedBy}`,
      );
    });

    it('should return ROLE_NOT_FOUND if role is not found', async () => {
      userContactDetailsRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValueOnce({ id: 1 });
      userRepository.findOne.mockResolvedValueOnce({ id: 1 });
      roleRepository.findOne.mockResolvedValue(null);

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual(
        ROLE_RESPONSES.ROLE_NOT_FOUND(inviteUserDto.roleId),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Role not found with ID: ${inviteUserDto.roleId}`,
      );
    });

    it('should return PROPERTY_NOT_FOUND if property is not found', async () => {
      userContactDetailsRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValueOnce({ id: 1 });
      userRepository.findOne.mockResolvedValueOnce({ id: 1 });
      roleRepository.findOne.mockResolvedValue({ id: 1 });
      propertyRepository.findOne.mockResolvedValue(null);

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(
          inviteUserDto.userPropertyDetails[0].propertyID,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Property not found with ID: ${inviteUserDto.userPropertyDetails[0].propertyID}`,
      );
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Database error';
      userContactDetailsRepository.findOne.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.inviteUser(inviteUserDto)).rejects.toThrow(
        errorMessage,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Failed to invite user: ${errorMessage}`,
      );
    });
  });
});
