import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from 'controllers/Authentication/authentication.controller';
import { AuthenticationService } from 'services/Authentication/authentication.service';
import { InviteUserDto } from 'dto/Authentication/invite-user.dto';
import { LoginDto } from 'dto/Authentication/login.dto';
import { ForgotPasswordDto } from 'dto/Authentication/forgot-password.dto';
import { ChangePasswordDto } from 'src/dto/Authentication/recover-password.dto';
import { ResetPasswordDto } from 'dto/Authentication/reset-password.dto';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

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
            inviteUser: jest
              .fn()
              .mockResolvedValue({ message: 'Invite sent successfully' }),
            login: jest.fn().mockResolvedValue({ message: 'Login successful' }),
            forgotPassword: jest.fn().mockResolvedValue({
              message: 'Password reset email sent successfully',
            }),
            changePassword: jest.fn().mockResolvedValue({
              message: 'Password has been reset successfully',
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

  describe('inviteUser', () => {
    it('should invite a user', async () => {
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

      const result = await controller.inviteUser(inviteUserDto);

      expect(result).toEqual({ message: 'Invite sent successfully' });
      expect(service.inviteUser).toHaveBeenCalledWith(inviteUserDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const result = await controller.login(loginDto);

      expect(result).toEqual({ message: 'Login successful' });
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({
        message: 'Password reset email sent successfully',
      });
      expect(service.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };
      jest
        .spyOn(service, 'forgotPassword')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        controller.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change the password', async () => {
      const resetToken = 'valid-token';
      const changePasswordDto: ChangePasswordDto = {
        newPassword: 'newpassword',
      };

      const result = await controller.recoverPassword(
        resetToken,
        changePasswordDto,
      );

      expect(result);
      expect(service.changePassword).toHaveBeenCalledWith(
        resetToken,
        changePasswordDto,
      );
    });

    it('should throw BadRequestException if reset token is invalid', async () => {
      const resetToken = 'invalid-token';
      const changePasswordDto: ChangePasswordDto = {
        newPassword: 'newpassword',
      };
      jest
        .spyOn(service, 'changePassword')
        .mockRejectedValue(new BadRequestException('Invalid token'));

      await expect(
        controller.recoverPassword(resetToken, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset the password', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        userId: 1,
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result);
      expect(service.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });

    it('should throw UnauthorizedException if old password is incorrect', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        userId: 1,
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };
      jest
        .spyOn(service, 'resetPassword')
        .mockRejectedValue(new UnauthorizedException('Incorrect old password'));

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const token = 'valid-token';

      const result = await controller.logout(token);

      expect(result).toEqual({ data: { message: 'Logout successful' } });
      expect(service.logout).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException if session is not found', async () => {
      const token = 'invalid-token';
      jest
        .spyOn(service, 'logout')
        .mockRejectedValue(new UnauthorizedException('Session not found'));

      await expect(controller.logout(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
