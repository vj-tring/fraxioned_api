import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../authentication.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/user.entity';
import { Session } from '../../user/session.entity';
import { Role } from '../../user-role/role/role.entity';
import { UserRole } from '../../user-role/user-role.entity';
import { InviteUser } from '../../user/invite-user.entity';
import { MailService } from '../../mail/mail.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { HttpException, HttpStatus } from '@nestjs/common';

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

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: MockRepository;
  let sessionRepository: MockRepository;
  let roleRepository: MockRepository;
  let userRoleRepository: MockRepository;
  let inviteUserRepository: MockRepository;
  let mailService: Partial<MailService>;

  beforeEach(async () => {
    userRepository = createMockRepository();
    sessionRepository = createMockRepository();
    roleRepository = createMockRepository();
    userRoleRepository = createMockRepository();
    inviteUserRepository = createMockRepository();
    mailService = createMockMailService();

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

      expect(saveSpy).toBeCalled();
      expect(sendMailSpy).toBeCalled();
    });
  });

  describe('register', () => {
    it('should throw an error if phone number already exists', async () => {
      inviteUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.register({
          inviteToken: 'invalid',
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

      expect(saveUserRoleSpy).toBeCalled();
      expect(removeInviteUserSpy).toBeCalled();
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

      expect(saveSessionSpy).toBeCalled();
      expect(result).toHaveProperty('message', 'Login successful');
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

      expect(saveUserSpy).toBeCalled();
      expect(sendMailSpy).toBeCalled();
    });
  });

  describe('resetPassword', () => {
    it('should throw an error if reset token is invalid', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid', { newPassword: 'newpass' }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an error if reset token is expired', async () => {
      userRepository.findOne.mockResolvedValue({
        resetTokenExpires: new Date(Date.now() - 1000),
      });

      await expect(
        service.resetPassword('expired', { newPassword: 'newpass' }),
      ).rejects.toThrow(HttpException);
    });

    it('should reset password successfully', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        resetTokenExpires: new Date(Date.now() + 1000),
      });

      const saveUserSpy = jest.spyOn(userRepository, 'save');

      const result = await service.resetPassword('valid', {
        newPassword: 'newpass',
      });

      expect(saveUserSpy).toBeCalled();
      expect(result).toHaveProperty(
        'message',
        'Password has been reset successfully',
      );
    });
  });

  describe('logout', () => {
    it('should throw an error if session token is invalid', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      await expect(service.logout('invalidToken')).rejects.toThrow(
        HttpException,
      );
    });

    it('should logout successfully', async () => {
      sessionRepository.findOne.mockResolvedValue({
        id: 1,
        token: 'validToken',
      });

      const deleteSessionSpy = jest.spyOn(sessionRepository, 'delete');

      const result = await service.logout('validToken');

      expect(deleteSessionSpy).toBeCalled();
      expect(result).toHaveProperty('message', 'Logout successful');
    });
  });
});
