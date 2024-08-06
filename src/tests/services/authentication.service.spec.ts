import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../../main/service/authentication.service';
import { MailService } from 'src/main/service/mail.service';
import { LoggerService } from '../../main/service/logger.service';
import * as bcrypt from 'bcrypt';
import { InviteUserDto } from 'src/main/dto/requests/inviteUser.dto';
import { Repository } from 'typeorm';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { User } from 'src/main/entities/user.entity';
import { UserSession } from 'src/main/entities/user-session.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  INVITE_USER_RESPONSES,
  LOGIN_RESPONSES,
} from 'src/main/commons/constants/response-constants/auth.constant';
import { LoginDto } from 'src/main/dto/requests/login.dto';
import { Role } from 'src/main/entities/role.entity';
import { Properties } from 'src/main/entities/properties.entity';
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

jest.mock('services/mail.service');
jest.mock('services/logger.service');
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: MockRepository<User>;
  let userSessionRepository: MockRepository<UserSession>;
  let userPropertyRepository: MockRepository<UserProperties>;
  let userContactDetailsRepository: MockRepository<UserContactDetails>;
  let roleRepository: MockRepository<Role>;
  let propertyRepository: MockRepository<Properties>;
  let mailService: MailService;
  let logger: LoggerService;

  beforeEach(async () => {
    userRepository = createMockRepository();
    userSessionRepository = createMockRepository();
    userPropertyRepository = createMockRepository();
    userContactDetailsRepository = createMockRepository();
    roleRepository = createMockRepository();
    propertyRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: getRepositoryToken(UserContactDetails),
          useValue: userContactDetailsRepository,
        },
        {
          provide: getRepositoryToken(UserSession),
          useValue: userSessionRepository,
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
          provide: getRepositoryToken(Properties),
          useValue: propertyRepository,
        },
        { provide: MailService, useValue: { sendMail: jest.fn() } },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    mailService = module.get<MailService>(MailService);
    logger = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('inviteUser', () => {
    const inviteUserDto: InviteUserDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main St',
      addressLine2: '',
      state: 'NY',
      country: 'USA',
      city: 'New York',
      zipcode: '10001',
      phoneNumber: '1234567890',
      roleId: 1,
      createdBy: 1,
      updatedBy: 1,
      userPropertyDetails: {
        propertyID: 0,
        noOfShares: '',
        acquisitionDate: undefined,
      },
    };

    it('should invite a user successfully', async () => {
      userContactDetailsRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue({ id: 1 });
      roleRepository.findOne.mockResolvedValue({ id: 1 });
      propertyRepository.findOne.mockResolvedValue({ id: 0 });
      userRepository.create.mockReturnValue({});
      userRepository.save.mockResolvedValue({});
      userContactDetailsRepository.create.mockReturnValue({});
      userContactDetailsRepository.save.mockResolvedValue({});
      userPropertyRepository.create.mockReturnValue({});
      userPropertyRepository.save.mockResolvedValue({});
      (mailService.sendMail as jest.Mock).mockResolvedValue(null);

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual(INVITE_USER_RESPONSES.INVITE_SUCCESS);
      expect(mailService.sendMail).toHaveBeenCalledWith(
        inviteUserDto.email,
        'You are invited!',
        expect.stringContaining('Your temporary password is:'),
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
      userRepository.findOne.mockResolvedValue({ id: 1 });
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
      userRepository.findOne.mockResolvedValue({ id: 1 });
      roleRepository.findOne.mockResolvedValue({ id: 1 });
      propertyRepository.findOne.mockResolvedValue(null);

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual(
        USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(
          inviteUserDto.userPropertyDetails.propertyID,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Property not found with ID: ${inviteUserDto.userPropertyDetails.propertyID}`,
      );
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        id: 1,
        password: 'hashedPassword',
        isActive: true,
        role: {
          id: 1,
          roleName: 'User',
        } as Role,
        lastLoginTime: new Date(),
      };
      const userEmail = { user, contactValue: 'test@example.com' };
      const session = {
        token: 'token',
        expiresAt: new Date(Date.now() + 10000),
      };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userSessionRepository.create.mockReturnValue(session);
      userSessionRepository.save.mockResolvedValue(session);

      const result = await service.login(loginDto);

      expect(result).toEqual(
        LOGIN_RESPONSES.LOGIN_SUCCESS({ ...user, role: user.role }, session),
      );
      expect(logger.log).toHaveBeenCalledWith(
        `User attempting to login with email: ${loginDto.email}`,
      );
      expect(logger.log).toHaveBeenCalledWith(
        `Login successful for email: ${loginDto.email}`,
      );
    });

    it('should return USER_NOT_FOUND if email is not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      userContactDetailsRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginDto);

      expect(result).toEqual(LOGIN_RESPONSES.USER_NOT_FOUND);
      expect(logger.error).toHaveBeenCalledWith(
        `User not found with email: ${loginDto.email}`,
      );
    });

    it('should return USER_NOT_FOUND if user entity is not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const userEmail = { user: { id: 1 }, contactValue: 'test@example.com' };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginDto);

      expect(result).toEqual(LOGIN_RESPONSES.USER_NOT_FOUND);
      expect(logger.error).toHaveBeenCalledWith(
        `User entity not found for email: ${loginDto.email}`,
      );
    });

    it('should return USER_NOT_ACTIVE if user is not active', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, isActive: false };
      const userEmail = { user, contactValue: 'test@example.com' };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.login(loginDto);

      expect(result).toEqual(LOGIN_RESPONSES.USER_NOT_ACTIVE);
      expect(logger.error).toHaveBeenCalledWith(
        `User is not Active: ${loginDto.email}`,
      );
    });

    it('should return INVALID_CREDENTIALS if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, password: 'hashedPassword', isActive: true };
      const userEmail = { user, contactValue: 'test@example.com' };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login(loginDto);

      expect(result).toEqual(LOGIN_RESPONSES.INVALID_CREDENTIALS);
      expect(logger.error).toHaveBeenCalledWith(
        `Invalid credentials for email: ${loginDto.email}`,
      );
    });

    it('should return USER_NOT_ACTIVE if user is not active', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, isActive: false };
      const userEmail = { user, contactValue: 'test@example.com' };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.login(loginDto);

      expect(result).toEqual(LOGIN_RESPONSES.USER_NOT_ACTIVE);
      expect(logger.error).toHaveBeenCalledWith(
        `User is not Active: ${loginDto.email}`,
      );
    });

    it('should return INVALID_CREDENTIALS if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, password: 'hashedPassword', isActive: true };
      const userEmail = { user, contactValue: 'test@example.com' };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login(loginDto);

      expect(result).toEqual(LOGIN_RESPONSES.INVALID_CREDENTIALS);
      expect(logger.error).toHaveBeenCalledWith(
        `Invalid credentials for email: ${loginDto.email}`,
      );
    });

    it('should return INVALID_CREDENTIALS if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, password: 'hashedPassword', isActive: true };
      const userEmail = { user, contactValue: 'test@example.com' };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login(loginDto);

      expect(result).toEqual(LOGIN_RESPONSES.INVALID_CREDENTIALS);
      expect(logger.error).toHaveBeenCalledWith(
        `Invalid credentials for email: ${loginDto.email}`,
      );
    });
  });
  describe('forgotPassword', () => {
    it('should send a password reset email successfully', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };
      const user = { id: 1, resetToken: '', resetTokenExpires: null };
      const userEmail = { user, contactValue: 'test@example.com' };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      userRepository.save.mockResolvedValue(user);
      (mailService.sendMail as jest.Mock).mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({
        message: 'Password reset email sent successfully',
        status: 200,
      });
      expect(mailService.sendMail).toHaveBeenCalledWith(
        forgotPasswordDto.email,
        'Password Reset Request',
        expect.stringContaining(
          'To reset your password, please click the following link:',
        ),
      );
    });

    it('should return NotFoundException if user not found', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };

      userContactDetailsRepository.findOne.mockResolvedValue(null);

      await expect(service.forgotPassword(forgotPasswordDto)).resolves.toEqual({
        message: 'The account associated with this user was not found',
        status: 404,
      });
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const reset_token = 'resetToken';
      const changePasswordDto = { newPassword: 'newPassword' };
      const user = {
        id: 1,
        resetToken: reset_token,
        resetTokenExpires: new Date(Date.now() + 10000),
      };

      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      userRepository.save.mockResolvedValue(user);

      const result = await service.changePassword(
        reset_token,
        changePasswordDto,
      );

      expect(result).toEqual({
        message: 'Password has been reset successfully',
        status: 200,
      });
    });

    it('should return NotFoundException if user not found', async () => {
      const reset_token = 'resetToken';
      const changePasswordDto = { newPassword: 'newPassword' };

      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(reset_token, changePasswordDto),
      ).resolves.toEqual({
        message: 'The account associated with this user was not found',
        status: 404,
      });
    });

    it('should return BadRequestException if reset token is expired', async () => {
      const reset_token = 'resetToken';
      const changePasswordDto = { newPassword: 'newPassword' };
      const user = {
        id: 1,
        resetToken: reset_token,
        resetTokenExpires: new Date(Date.now() - 10000),
      };

      userRepository.findOne.mockResolvedValue(user);

      await expect(
        service.changePassword(reset_token, changePasswordDto),
      ).resolves.toEqual({
        message: 'The password reset token has expired',
        status: 400,
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const resetPasswordDto = {
        userId: 1,
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };
      const user = { id: 1, password: 'hashedPassword', isActive: true };

      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      userRepository.update.mockResolvedValue(user);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toEqual({
        message: 'Password reset successfully',
        status: 200,
      });
    });

    it('should return NotFoundException if user not found', async () => {
      const resetPasswordDto = {
        userId: 1,
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).resolves.toEqual({
        message: 'The account associated with this user was not found',
        status: 404,
      });
    });

    it('should return UnauthorizedException if old password is invalid', async () => {
      const resetPasswordDto = {
        userId: 1,
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };
      const user = { id: 1, password: 'hashedPassword', isActive: true };

      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.resetPassword(resetPasswordDto)).resolves.toEqual({
        message: 'The provided old password is incorrect',
        status: 401,
      });
    });
  });

  describe('validateUser', () => {
    it('should validate the user successfully', async () => {
      const userId = 1;
      const accessToken = 'accessToken';
      const session = {
        user: { id: userId },
        token: accessToken,
        expiresAt: new Date(Date.now() + 10000),
      };
      const user = { id: userId, isActive: true };

      userSessionRepository.findOne.mockResolvedValue(session);
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser(userId, accessToken);

      expect(result).toBe(true);
      expect(logger.log).toHaveBeenCalledWith(
        `Validating user with ID: ${userId} and access token: ${accessToken}`,
      );
      expect(logger.log).toHaveBeenCalledWith(
        `User validated successfully with ID: ${userId}`,
      );
    });

    it('should log error and return false if an error occurs', async () => {
      const userId = 1;
      const accessToken = 'accessToken';
      const errorMessage = 'Database error';

      userSessionRepository.findOne.mockRejectedValue(new Error(errorMessage));

      const result = await service.validateUser(userId, accessToken);

      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const token = 'token';
      const session = { token };

      userSessionRepository.findOne.mockResolvedValue(session);
      userSessionRepository.delete.mockResolvedValue({});

      const result = await service.logout(token);

      expect(result).toEqual({
        message: 'Logout successful',
        status: 200,
      });
    });

    it('should return UnauthorizedException if session is invalid or expired', async () => {
      const token = 'token';

      userSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.logout(token)).resolves.toEqual({
        message: 'The session has expired or is invalid',
        status: 401,
      });
    });
  });
});
