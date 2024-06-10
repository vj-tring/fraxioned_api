import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from '../authentication.controller';
import { AuthenticationService } from '../authentication.service';
import { InviteDTO } from '../dto/invite.dto';
import { RegisterDTO } from '../dto/register.dto';
import { LoginDTO } from '../dto/login.dto';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { ResetPasswordDTO } from '../dto/reset-password.dto';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            sendInvite: jest
              .fn()
              .mockResolvedValue({ message: 'Invitation sent successfully' }),
            register: jest
              .fn()
              .mockResolvedValue({ message: 'User registered successfully' }),
            login: jest.fn().mockResolvedValue({ token: 'some-token' }),
            forgotPassword: jest
              .fn()
              .mockResolvedValue({
                message: 'Password reset email sent successfully',
              }),
            resetPassword: jest
              .fn()
              .mockResolvedValue({ message: 'Password reset successfully' }),
            logout: jest
              .fn()
              .mockResolvedValue({ message: 'Logout successful' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendInvite', () => {
    it('should send an invite and return a success message', async () => {
      const inviteDTO: InviteDTO = {
        email: 'test@example.com', roleId: 1,
        invitedBy: 1
      };
      const result = await controller.sendInvite(inviteDTO);
      expect(result).toEqual({ message: 'Invitation sent successfully' });
      expect(service.sendInvite).toHaveBeenCalledWith(inviteDTO);
    });
  });

  describe('register', () => {
    it('should register a user and return a success message', async () => {
      const registerDTO: RegisterDTO = {
        inviteToken: 'some-token',
        username: 'testuser',
        phone: '1234567890',
        secondaryPhone: '0987654321',
        secondaryEmail: 'testuser_secondary@example.com',
        address1: '123 Main St',
        address2: 'Apt 4B',
        state: 'CA',
        city: 'Los Angeles',
        zip: '90001',
        imageUrl: 'http://example.com/images/testuser.jpg',
        password: 'password',
      };
      const result = await controller.register(registerDTO);
      expect(result).toEqual({ message: 'User registered successfully' });
      expect(service.register).toHaveBeenCalledWith(registerDTO);
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const loginDTO: LoginDTO = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = await controller.login(loginDTO);
      expect(result).toEqual({ token: 'some-token' });
      expect(service.login).toHaveBeenCalledWith(loginDTO);
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email and return a success message', async () => {
      const forgotPasswordDTO: ForgotPasswordDTO = { email: 'test@example.com' };
      const result = await controller.forgotPassword(forgotPasswordDTO);
      expect(result).toEqual({ message: 'Password reset email sent successfully' });
      expect(service.forgotPassword).toHaveBeenCalledWith(forgotPasswordDTO);
    });
  });

  describe('resetPassword', () => {
    it('should reset the password and return a success message', async () => {
      const resetToken = 'some-reset-token';
      const resetPasswordDTO: ResetPasswordDTO = {
        newPassword: 'newpassword',
      };
      const result = await controller.resetPassword(resetToken, resetPasswordDTO);
      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(service.resetPassword).toHaveBeenCalledWith(resetToken, resetPasswordDTO);
    });
  });

  describe('logout', () => {
    it('should logout a user and return a success message', async () => {
      const token = 'Bearer some-token';
      const result = await controller.logout(token);
      expect(result).toEqual({ message: 'Logout successful' });
      expect(service.logout).toHaveBeenCalledWith(token);
    });
  });
});
