import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../authentication.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@user/user.entity';
import { Session } from '@user/session.entity';
import { Role } from '@user-role/role/role.entity';
import { UserRole } from '@user-role/user-role.entity';
import { InviteUser } from '@user/invite-user.entity';
import { MailService } from '@mail/mail.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { HttpException } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
});

const createMockMailService = (): Partial<MailService> => ({
  sendMail: jest.fn(),
});

const createMockLoggerService = (): Partial<LoggerService> => ({
  log: jest.fn(),
  error: jest.fn(),
});

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: MockRepository;
  let sessionRepository: MockRepository;
  let roleRepository: MockRepository;
  let userRoleRepository: MockRepository;
  let inviteUserRepository: MockRepository;
  let mailService: Partial<MailService>;
  let logger: Partial<LoggerService>;

  beforeEach(async () => {
    userRepository = createMockRepository();
    sessionRepository = createMockRepository();
    roleRepository = createMockRepository();
    userRoleRepository = createMockRepository();
    inviteUserRepository = createMockRepository();
    mailService = createMockMailService();
    logger = createMockLoggerService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Session), useValue: sessionRepository },
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        { provide: getRepositoryToken(UserRole), useValue: userRoleRepository },
        {
          provide: getRepositoryToken(InviteUser),
          useValue: inviteUserRepository,
        },
        { provide: MailService, useValue: mailService },
        { provide: LoggerService, useValue: logger },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendInvite', () => {
    it('should throw an error if email already exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      await expect(
        service.sendInvite({ email: 'test@test.com', roleId: 1, invitedBy: 1 }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an error if invite already sent to email', async () => {
      userRepository.findOne.mockResolvedValue(null);
      inviteUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      await expect(
        service.sendInvite({ email: 'test@test.com', roleId: 1, invitedBy: 1 }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an error if role is invalid', async () => {
      userRepository.findOne.mockResolvedValue(null);
      inviteUserRepository.findOne.mockResolvedValue(null);
      roleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.sendInvite({ email: 'test@test.com', roleId: 1, invitedBy: 1 }),
      ).rejects.toThrow(HttpException);
    });

    it('should send an invite successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      inviteUserRepository.findOne.mockResolvedValue(null);
      roleRepository.findOne.mockResolvedValue({ id: 1 });

      const saveSpy = jest.spyOn(inviteUserRepository, 'save');
      const sendMailSpy = jest.spyOn(mailService, 'sendMail');

      await service.sendInvite({
        email: 'test@test.com',
        roleId: 1,
        invitedBy: 1,
      });

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(sendMailSpy).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('Invite sent to test@test.com');
    });
  });

  describe('register', () => {
    it('should throw an error if phone number already exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        phone: '1234567890',
      });

      await expect(
        service.register({
          inviteToken: 'invalid',
          firstName: 'test',
          lastName: 'test',
          username: 'test',
          password: 'pass',
          phone: '1234567890',
          secondaryPhone: '',
          secondaryEmail: '',
          address1: '',
          address2: '',
          state: '',
          city: '',
          zip: '',
          imageUrl: '',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an error if invite token is invalid', async () => {
      inviteUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.register({
          inviteToken: 'invalid',
          firstName: 'test',
          lastName: 'test',
          username: 'test',
          password: 'pass',
          phone: '',
          secondaryPhone: '',
          secondaryEmail: '',
          address1: '',
          address2: '',
          state: '',
          city: '',
          zip: '',
          imageUrl: '',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an error if invite token is expired', async () => {
      inviteUserRepository.findOne.mockResolvedValue({
        inviteTokenExpires: new Date(Date.now() - 1000),
      });

      await expect(
        service.register({
          inviteToken: 'expired',
          firstName: 'test',
          lastName: 'test',
          username: 'test',
          password: 'pass',
          phone: '',
          secondaryPhone: '',
          secondaryEmail: '',
          address1: '',
          address2: '',
          state: '',
          city: '',
          zip: '',
          imageUrl: '',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should register a user successfully', async () => {
      inviteUserRepository.findOne.mockResolvedValue({
        email: 'test@test.com',
        inviteTokenExpires: new Date(Date.now() + 1000),
        roleId: 1,
      });
      userRepository.save.mockResolvedValue({ id: 1, email: 'test@test.com' });

      const saveUserRoleSpy = jest.spyOn(userRoleRepository, 'save');
      const removeInviteUserSpy = jest.spyOn(inviteUserRepository, 'remove');

      await service.register({
        inviteToken: 'valid',
        firstName: 'test',
        lastName: 'test',
        username: 'test',
        password: 'pass',
        phone: '',
        secondaryPhone: '',
        secondaryEmail: '',
        address1: '',
        address2: '',
        state: '',
        city: '',
        zip: '',
        imageUrl: '',
      });

      expect(saveUserRoleSpy).toHaveBeenCalledTimes(1);
      expect(removeInviteUserSpy).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('User registered with email test@test.com');
    });
  });

  describe('login', () => {
    it('should throw an error if email is invalid', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'invalid@test.com', password: 'pass' }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an error if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue({ password: 'hashedPassword' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpass' }),
      ).rejects.toThrow(HttpException);
    });

    it('should login successfully', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      sessionRepository.findOne.mockResolvedValue(null);

      const saveSessionSpy = jest.spyOn(sessionRepository, 'save');

      const result = await service.login({
        email: 'test@test.com',
        password: 'pass',
      });

      expect(saveSessionSpy).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('message', 'Login successful');
      expect(logger.log).toHaveBeenCalledWith('User test@test.com logged in successfully');
    });
  });

  describe('forgotPassword', () => {
    it('should throw an error if email not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.forgotPassword({ email: 'invalid@test.com' }),
      ).rejects.toThrow(HttpException);
    });

    it('should send a reset password email', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      const saveUserSpy = jest.spyOn(userRepository, 'save');
      const sendMailSpy = jest.spyOn(mailService, 'sendMail');

      await service.forgotPassword({ email: 'test@test.com' });

      expect(saveUserSpy).toHaveBeenCalledTimes(1);
      expect(sendMailSpy).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('Password reset email sent to test@test.com');
    });
  });

  describe('resetPassword', () => {
    it('should throw an error if reset token is invalid', async () => {
      userRepository.findOne.mockResolvedValue(null);
  
      await expect(
        service.resetPassword('invalidToken', { newPassword: 'newpass' }),
      ).rejects.toThrow(HttpException);
    });
  
    it('should throw an error if reset token is expired', async () => {
      userRepository.findOne.mockResolvedValue({
        resetTokenExpires: new Date(Date.now() - 1000),
      });
  
      await expect(
        service.resetPassword('expiredToken', { newPassword: 'newpass' }),
      ).rejects.toThrow(HttpException);
    });
  
    it('should reset password successfully', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        resetTokenExpires: new Date(Date.now() + 1000),
      };
      userRepository.findOne.mockResolvedValue(user);
  
      const saveSpy = jest.spyOn(userRepository, 'save');
  
      await service.resetPassword('validToken', { newPassword: 'newpass' });
  
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        password: expect.any(String),
        resetToken: null,
        resetTokenExpires: null,
      });
      expect(logger.log).toHaveBeenCalledWith(`Password reset successfully for ${user.email}`);
    });
  });

  describe('logout', () => {
    it('should throw an error if session token is invalid', async () => {
      sessionRepository.findOne.mockResolvedValue(null);
  
      await expect(service.logout('invalidToken')).rejects.toThrow(HttpException);
    });
  
    it('should logout successfully', async () => {
      const session = { token: 'validToken' };
      sessionRepository.findOne.mockResolvedValue(session);
  
      const deleteSpy = jest.spyOn(sessionRepository, 'delete');
  
      const result = await service.logout('validToken');
  
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith({ token: 'validToken' });
      expect(result).toEqual({ message: 'Logout successful' });
      expect(logger.log).toHaveBeenCalledWith(`User logged out with token validToken`);
    });
  });
  
});
