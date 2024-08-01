import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from 'src/main/controller/authentication.controller';
import { AuthenticationService } from 'src/main/service/authentication.service';
import { InviteUserDto } from 'src/main/dto/inviteUser.dto';
import { LoginDto } from 'src/main/dto/login.dto';
import { ForgotPasswordDto } from 'src/main/dto/forgotPassword.dto';
import { ResetPasswordDto } from 'src/main/dto/resetPassword.dto';
import { ChangePasswordDto } from 'src/main/dto/recoverPassword.dto';
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
            inviteUser: jest.fn(),
            login: jest.fn(),
            forgotPassword: jest.fn(),
            changePassword: jest.fn(),
            resetPassword: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
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
      const userAuth = { userId: 1, accessToken: 'someAccessToken' };
      const result = { message: 'Invite sent successfully' };
      jest.spyOn(service, 'inviteUser').mockResolvedValue(result);

      expect(await controller.inviteUser(userAuth, inviteUserDto)).toEqual(
        result,
      );
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = {
        message: 'Login successful',
        user: { id: 1 },
        session: { token: 'token', expires_at: new Date() },
      };
      jest.spyOn(service, 'login').mockResolvedValue(result);

      expect(await controller.login(loginDto)).toEqual(result);
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email successfully', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };
      const result = { message: 'Password reset email sent successfully' };
      jest.spyOn(service, 'forgotPassword').mockResolvedValue(result);

      expect(await controller.forgotPassword(forgotPasswordDto)).toEqual(
        result,
      );
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
      ).resolves.toEqual(new NotFoundException('User not found'));
    });
  });

  describe('recoverPassword', () => {
    it('should change the password successfully', async () => {
      const resetToken = 'resetToken';
      const changePasswordDto: ChangePasswordDto = {
        newPassword: 'newPassword',
      };
      const result = { message: 'Password has been reset successfully' };
      jest.spyOn(service, 'changePassword').mockResolvedValue(result);

      expect(
        await controller.recoverPassword(resetToken, changePasswordDto),
      ).toEqual(result);
    });

    it('should throw BadRequestException if reset token is expired', async () => {
      const resetToken = 'resetToken';
      const changePasswordDto: ChangePasswordDto = {
        newPassword: 'newPassword',
      };
      jest
        .spyOn(service, 'changePassword')
        .mockRejectedValue(new BadRequestException('Reset token expired'));

      await expect(
        controller.recoverPassword(resetToken, changePasswordDto),
      ).resolves.toEqual(new BadRequestException('Reset token expired'));
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'newPassword',
        oldPassword: '',
        userId: 0,
      };
      const result = { message: 'Password reset successfully' };
      jest.spyOn(service, 'resetPassword').mockResolvedValue(result);

      expect(await controller.resetPassword(resetPasswordDto)).toEqual(result);
    });

    it('should throw UnauthorizedException if reset token is invalid', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'newPassword',
        oldPassword: '',
        userId: 0,
      };
      jest
        .spyOn(service, 'resetPassword')
        .mockRejectedValue(new UnauthorizedException('Invalid reset token'));

      await expect(controller.resetPassword(resetPasswordDto)).resolves.toEqual(
        new UnauthorizedException('Invalid reset token'),
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const token = 'Bearer token';
      const result = { message: 'Logout successful' };
      jest.spyOn(service, 'logout').mockResolvedValue(result);

      expect(await controller.logout(token)).toEqual(result);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'Bearer invalidToken';
      jest
        .spyOn(service, 'logout')
        .mockRejectedValue(new UnauthorizedException('Invalid token'));

      await expect(controller.logout(token)).resolves.toEqual(
        new UnauthorizedException('Invalid token'),
      );
    });
  });
});
