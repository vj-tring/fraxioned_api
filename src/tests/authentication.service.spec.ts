import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../main/service/authentication.service';
import { MailService } from '../main/service/mail.service';
import { LoggerService } from '../main/service/logger.service';
import {
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InviteUserDto } from 'src/main/dto/inviteUser.dto';
import { Repository } from 'typeorm';
import { UserContactDetails } from 'src/main/entities/user_contact_details.entity';
import { User } from 'src/main/entities/user.entity';
import { UserSessions } from 'src/main/entities/user_sessions.entity';
import { UserProperties } from 'src/main/entities/user_properties.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

jest.mock('../main/service/mail.service');
jest.mock('../main/service/logger.service');
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: MockRepository<User>;
  let userSessionRepository: MockRepository<UserSessions>;
  let userPropertyRepository: MockRepository<UserProperties>;
  let userContactDetailsRepository: MockRepository<UserContactDetails>;
  let mailService: MailService;
  let logger: LoggerService;

  beforeEach(async () => {
    userRepository = createMockRepository();
    userSessionRepository = createMockRepository();
    userPropertyRepository = createMockRepository();
    userContactDetailsRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: getRepositoryToken(UserContactDetails),
          useValue: userContactDetailsRepository,
        },
        {
          provide: getRepositoryToken(UserSessions),
          useValue: userSessionRepository,
        },
        {
          provide: getRepositoryToken(UserProperties),
          useValue: userPropertyRepository,
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
    it('should invite a user successfully', async () => {
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
        created_by: 1,
        updated_by: 1,
        userPropertyDetails: {
          propertyID: 0,
          noOfShares: '',
          acquisitionDate: undefined,
        },
      };

      userContactDetailsRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({});
      userRepository.save.mockResolvedValue({});
      userContactDetailsRepository.create.mockReturnValue({});
      userContactDetailsRepository.save.mockResolvedValue({});
      userPropertyRepository.create.mockReturnValue({});
      userPropertyRepository.save.mockResolvedValue({});
      (mailService.sendMail as jest.Mock).mockResolvedValue(null);

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual({ message: 'Invite sent successfully' });
      expect(mailService.sendMail).toHaveBeenCalledWith(
        inviteUserDto.email,
        'You are invited!',
        expect.stringContaining('Your temporary password is:'),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
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
        created_by: 1,
        updated_by: 1,
        userPropertyDetails: {
          propertyID: 0,
          noOfShares: '',
          acquisitionDate: undefined,
        },
      };

      userContactDetailsRepository.findOne.mockResolvedValue({});
      await expect(service.inviteUser(inviteUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const user = {
        id: 1,
        password: 'hashedPassword',
        isActive: true,
        lastLoginTime: null,
      };
      const userEmail = { user };
      const session = { token: 'token', expiresAt: new Date() };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.save.mockResolvedValue(user);
      userSessionRepository.findOne.mockResolvedValue(session);
      userSessionRepository.save.mockResolvedValue(session);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        message: 'Login successful',
        user,
        session: { token: session.token, expires_at: session.expiresAt },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };

      userContactDetailsRepository.findOne.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const user = { id: 1, password: 'hashedPassword', isActive: true };
      const userEmail = { user };

      userContactDetailsRepository.findOne.mockResolvedValue(userEmail);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
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
      });
      expect(mailService.sendMail).toHaveBeenCalledWith(
        forgotPasswordDto.email,
        'Password Reset Request',
        expect.stringContaining(
          'To reset your password, please click the following link:',
        ),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };

      userContactDetailsRepository.findOne.mockResolvedValue(null);

      await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
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
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const reset_token = 'resetToken';
      const changePasswordDto = { newPassword: 'newPassword' };

      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(reset_token, changePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if reset token is expired', async () => {
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
      ).rejects.toThrow(BadRequestException);
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

      expect(result).toEqual({ message: 'Password reset successfully' });
    });

    it('should throw NotFoundException if user not found', async () => {
      const resetPasswordDto = {
        userId: 1,
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if old password is invalid', async () => {
      const resetPasswordDto = {
        userId: 1,
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };
      const user = { id: 1, password: 'hashedPassword', isActive: true };

      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
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

    it('should throw UnauthorizedException if an error occurs', async () => {
      const userId = 1;
      const accessToken = 'accessToken';
      const errorMessage = 'Database error';

      userSessionRepository.findOne.mockRejectedValue(new Error(errorMessage));

      await expect(service.validateUser(userId, accessToken)).rejects.toThrow(
        new UnauthorizedException(
          'The provided user ID or access token is invalid',
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Validation failed for user ID: ${userId} with error: ${errorMessage}`,
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const token = 'token';
      const session = { token };

      userSessionRepository.findOne.mockResolvedValue(session);
      userSessionRepository.delete.mockResolvedValue({});

      const result = await service.logout(token);

      expect(result).toEqual({ message: 'Logout successful' });
    });

    it('should throw UnauthorizedException if session is invalid or expired', async () => {
      const token = 'token';

      userSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.logout(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});