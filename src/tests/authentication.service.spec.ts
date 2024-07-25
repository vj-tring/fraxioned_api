import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../service/authentication.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'entities/user.entity';
import { UserAddressDetails } from 'entities/user_address_details.entity';
import { UserEmailDetails } from 'entities/user_email_details.entity';
import { UserPhoneDetails } from 'entities/user_phone_details.entity';
import { UserRole } from 'entities/user_role.entity';
import { Sessions } from 'entities/sessions.entity';
import { MailService } from 'src/service/mail.service';
import { LoggerService } from 'src/service/logger.service';
import { Repository } from 'typeorm';
import { InviteUserDto } from 'dto/inviteUser.dto';
import { LoginDto } from 'src/dto/login.dto';
import {
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from 'dto/forgotPassword.dto';
import { ChangePasswordDto } from 'dto/recoverPassword.dto';
import { ResetPasswordDto } from 'dto/resetPassword.dto';

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: MockRepository<User>;
  let userAddressRepository: MockRepository<UserAddressDetails>;
  let userEmailRepository: MockRepository<UserEmailDetails>;
  let userPhoneRepository: MockRepository<UserPhoneDetails>;
  let userRoleRepository: MockRepository<UserRole>;
  let sessionRepository: MockRepository<Sessions>;
  let mailService: MailService;
  // let logger: LoggerService;

  beforeEach(async () => {
    userRepository = createMockRepository();
    userAddressRepository = createMockRepository();
    userEmailRepository = createMockRepository();
    userPhoneRepository = createMockRepository();
    userRoleRepository = createMockRepository();
    sessionRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: getRepositoryToken(UserAddressDetails),
          useValue: userAddressRepository,
        },
        {
          provide: getRepositoryToken(UserEmailDetails),
          useValue: userEmailRepository,
        },
        {
          provide: getRepositoryToken(UserPhoneDetails),
          useValue: userPhoneRepository,
        },
        { provide: getRepositoryToken(UserRole), useValue: userRoleRepository },
        { provide: getRepositoryToken(Sessions), useValue: sessionRepository },
        { provide: MailService, useValue: { sendMail: jest.fn() } },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    mailService = module.get<MailService>(MailService);
    // logger = module.get<LoggerService>(LoggerService);
  });

  describe('inviteUser', () => {
    it('should invite a user successfully', async () => {
      const inviteUserDto: InviteUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main St',
        addressLine2: '',
        state: 'CA',
        city: 'Los Angeles',
        zip: '90001',
        phoneNumber: '1234567890',
        roleId: 1,
        updated_by: 0,
        created_by: 0,
      };

      userEmailRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({ id: 1 });
      userRepository.save.mockResolvedValue({ id: 1 });
      userAddressRepository.create.mockReturnValue({});
      userAddressRepository.save.mockResolvedValue({});
      userEmailRepository.create.mockReturnValue({});
      userEmailRepository.save.mockResolvedValue({});
      userPhoneRepository.create.mockReturnValue({});
      userPhoneRepository.save.mockResolvedValue({});
      userRoleRepository.create.mockReturnValue({});
      userRoleRepository.save.mockResolvedValue({});

      const result = await service.inviteUser(inviteUserDto);

      expect(result).toEqual({ message: 'Invite sent successfully' });
      expect(userEmailRepository.findOne).toHaveBeenCalledWith({
        where: { email_id: inviteUserDto.email },
      });
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(mailService.sendMail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const inviteUserDto: InviteUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main St',
        addressLine2: '',
        state: 'CA',
        city: 'Los Angeles',
        zip: '90001',
        phoneNumber: '1234567890',
        roleId: 1,
        updated_by: 0,
        created_by: 0,
      };

      userEmailRepository.findOne.mockResolvedValue({});

      await expect(service.inviteUser(inviteUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userEmailRepository.findOne).toHaveBeenCalledWith({
        where: { email_id: inviteUserDto.email },
      });
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        id: 1,
        password: await bcrypt.hash('password', 10),
        is_active: 1,
      };
      const userEmail = { user };

      userEmailRepository.findOne.mockResolvedValue(userEmail);
      sessionRepository.findOne.mockResolvedValue(null);
      sessionRepository.create.mockReturnValue({});
      sessionRepository.save.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result.message).toEqual('Login successful');
      expect(userEmailRepository.findOne).toHaveBeenCalledWith({
        where: { email_id: loginDto.email },
        relations: ['user'],
      });
      expect(sessionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      userEmailRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
      expect(userEmailRepository.findOne).toHaveBeenCalledWith({
        where: { email_id: loginDto.email },
        relations: ['user'],
      });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user = {
        id: 1,
        password: await bcrypt.hash('password', 10),
        is_active: 1,
      };
      const userEmail = { user };

      userEmailRepository.findOne.mockResolvedValue(userEmail);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userEmailRepository.findOne).toHaveBeenCalledWith({
        where: { email_id: loginDto.email },
        relations: ['user'],
      });
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email successfully', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };
      const user = {
        id: 1,
        email: 'test@example.com',
        reset_token: '',
        reset_token_expires: null,
      };
      const userEmail = { email_id: 'test@example.com', user };

      userEmailRepository.findOne.mockResolvedValue(userEmail);
      userRepository.save.mockResolvedValue(user);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({
        message: 'Password reset email sent successfully',
      });
      expect(userEmailRepository.findOne).toHaveBeenCalledWith({
        where: { email_id: forgotPasswordDto.email },
        relations: ['user'],
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(mailService.sendMail).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      userEmailRepository.findOne.mockResolvedValue(null);

      await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userEmailRepository.findOne).toHaveBeenCalledWith({
        where: { email_id: forgotPasswordDto.email },
        relations: ['user'],
      });
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const resetToken = 'valid-token';
      const changePasswordDto: ChangePasswordDto = {
        newPassword: 'newpassword',
      };
      const user = {
        id: 1,
        reset_token: resetToken,
        reset_token_expires: new Date(Date.now() + 60 * 60 * 1000),
      };

      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue(user);

      const result = await service.changePassword(
        resetToken,
        changePasswordDto,
      );

      expect(result).toEqual({
        message: 'Password has been reset successfully',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { reset_token: resetToken },
      });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const resetToken = 'invalid-token';
      const changePasswordDto: ChangePasswordDto = {
        newPassword: 'newpassword',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(resetToken, changePasswordDto),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { reset_token: resetToken },
      });
    });

    it('should throw BadRequestException if reset token is expired', async () => {
      const resetToken = 'expired-token';
      const changePasswordDto: ChangePasswordDto = {
        newPassword: 'newpassword',
      };
      const user = {
        id: 1,
        reset_token: resetToken,
        reset_token_expires: new Date(Date.now() - 60 * 60 * 1000),
      };

      userRepository.findOne.mockResolvedValue(user);

      await expect(
        service.changePassword(resetToken, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { reset_token: resetToken },
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        userId: 1,
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const user = {
        id: 1,
        password: await bcrypt.hash('oldpassword', 10),
        is_active: 1,
      };

      userRepository.findOne.mockResolvedValue(user);
      userRepository.update.mockResolvedValue({});

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: resetPasswordDto.userId },
      });
      expect(userRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        userId: 1,
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: resetPasswordDto.userId },
      });
    });

    it('should throw UnauthorizedException if old password is incorrect', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        userId: 1,
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };
      const user = {
        id: 1,
        password: await bcrypt.hash('oldpassword', 10),
        is_active: 1,
      };

      userRepository.findOne.mockResolvedValue(user);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: resetPasswordDto.userId },
      });
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        userId: 1,
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const user = {
        id: 1,
        password: await bcrypt.hash('oldpassword', 10),
        is_active: 0,
      };

      userRepository.findOne.mockResolvedValue(user);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: resetPasswordDto.userId },
      });
    });
  });

  describe('logout', () => {
    it('should logout a user successfully', async () => {
      const token = 'valid-token';
      const session = { token };

      sessionRepository.findOne.mockResolvedValue(session);
      sessionRepository.delete.mockResolvedValue({});

      const result = await service.logout(token);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { token },
      });
      expect(sessionRepository.delete).toHaveBeenCalledWith({ token });
    });

    it('should throw UnauthorizedException if session is not found', async () => {
      const token = 'invalid-token';

      sessionRepository.findOne.mockResolvedValue(null);

      await expect(service.logout(token)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { token },
      });
    });
  });

  describe('validateUser', () => {
    it('should validate a user successfully', async () => {
      const userId = 1;
      const accessToken = 'valid-token';
      const session = {
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      const user = { id: userId, is_active: 1 };

      sessionRepository.findOne.mockResolvedValue(session);
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser(userId, accessToken);

      expect(result).toBe(true);
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId }, token: accessToken },
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return false if session is invalid', async () => {
      const userId = 1;
      const accessToken = 'invalid-token';

      sessionRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(userId, accessToken);

      expect(result).toBe(false);
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId }, token: accessToken },
      });
    });

    it('should return false if user is inactive', async () => {
      const userId = 1;
      const accessToken = 'valid-token';
      const session = {
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      const user = { id: userId, is_active: 0 };

      sessionRepository.findOne.mockResolvedValue(session);
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser(userId, accessToken);

      expect(result).toBe(false);
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId }, token: accessToken },
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
