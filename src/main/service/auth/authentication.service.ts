import { Injectable } from '@nestjs/common';
import { User } from 'src/main/entities/user.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/main/dto/requests/auth/login.dto';
import { LoggerService } from 'src/main/service/logger.service';
import { UserSession } from 'src/main/entities/user-session.entity';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from 'src/main/dto/requests/auth/forgotPassword.dto';
import { ChangePasswordDto } from 'src/main/dto/requests/auth/recoverPassword.dto';
import { ResetPasswordDto } from 'src/main/dto/requests/auth/resetPassword.dto';
import {
  LOGIN_RESPONSES,
  FORGOT_PASSWORD_RESPONSES,
  CHANGE_PASSWORD_RESPONSES,
  RESET_PASSWORD_RESPONSES,
  LOGOUT_RESPONSES,
} from 'src/main/commons/constants/response-constants/auth.constant';
import { authConstants } from 'src/main/commons/constants/authentication/authentication.constants';
import {
  mailSubject,
  mailTemplates,
} from 'src/main/commons/constants/email/mail.constants';
import { MailService } from 'src/main/email/mail.service';
import { Role } from 'src/main/entities/role.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserContactDetails)
    private readonly userContactRepository: Repository<UserContactDetails>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async login(loginDto: LoginDto): Promise<object> {
    const { email, password } = loginDto;
    this.logger.log(`User attempting to login with email: ${email}`);

    const userEmail = await this.userContactRepository.findOne({
      where: { primaryEmail: email },
      relations: ['user'],
    });

    if (!userEmail || !userEmail.user) {
      this.logger.error(`User not found with email: ${email}`);
      return LOGIN_RESPONSES.USER_NOT_FOUND;
    }

    const user = await this.userRepository.findOne({
      where: { id: userEmail.user.id },
      relations: ['contactDetails', 'role'],
      select: {
        role: { id: true, roleName: true },
        contactDetails: {
          id: true,
          optionalEmailOne: true,
          optionalEmailTwo: true,
          optionalPhoneOne: true,
          optionalPhoneTwo: true,
          primaryEmail: true,
          primaryPhone: true,
          secondaryEmail: true,
          secondaryPhone: true,
        },
      },
    });

    if (!user) {
      this.logger.error(`User entity not found for email: ${email}`);
      return LOGIN_RESPONSES.USER_NOT_FOUND;
    }

    if (!user.isActive) {
      this.logger.error(`User is not Active: ${email}`);
      return LOGIN_RESPONSES.USER_NOT_ACTIVE;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.error(`Invalid credentials for email: ${email}`);
      return LOGIN_RESPONSES.INVALID_CREDENTIALS;
    }

    user.lastLoginTime = new Date();
    await this.userRepository.save(user);

    const session = this.userSessionRepository.create({
      user,
      token: crypto.randomBytes(50).toString('hex'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await this.userSessionRepository.save(session);

    const userDetails: Partial<User> = {
      id: user.id,
      role: {
        id: user.role.id,
        roleName: user.role.roleName,
      } as Role,
      firstName: user.firstName,
      lastName: user.lastName,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      city: user.city,
      state: user.state,
      zipcode: user.zipcode,
      country: user.country,
      imageURL: user.imageURL,
      isActive: user.isActive,
      createdAt: user.createdAt,
      createdBy: user.createdBy,
      updatedAt: user.updatedAt,
      updatedBy: user.updatedBy,
      contactDetails: user.contactDetails,
    };
    this.logger.log(`Login successful for email: ${email}`);
    return LOGIN_RESPONSES.LOGIN_SUCCESS(userDetails, session);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<object> {
    this.logger.log(
      `Forgot password request for email: ${forgotPasswordDto.email}`,
    );

    const userEmail = await this.userContactRepository.findOne({
      where: { primaryEmail: forgotPasswordDto.email },
      relations: ['user'],
    });

    if (!userEmail || !userEmail.user) {
      this.logger.error(
        `User not found with email: ${forgotPasswordDto.email}`,
      );
      return FORGOT_PASSWORD_RESPONSES.USER_NOT_FOUND;
    }

    const user = userEmail.user;
    user.resetToken = crypto.randomBytes(50).toString('hex').slice(0, 100);
    user.resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    await this.userRepository.save(user);

    const resetLink = `${authConstants.hostname}:${authConstants.port}/${authConstants.endpoints.forgotPassword}?resetToken=${user.resetToken}`;
    const email = userEmail.primaryEmail;
    const subject = mailSubject.auth.forgotPassword;
    const template = mailTemplates.auth.forgotPassword;
    const context = {
      name: `${user.firstName} ${user.lastName}`,
      link: resetLink,
    };

    await this.mailService.sendMail(email, subject, template, context);

    this.logger.log(
      `Password reset email sent successfully to ${forgotPasswordDto.email}`,
    );
    return FORGOT_PASSWORD_RESPONSES.EMAIL_SENT;
  }

  async changePassword(
    reset_token: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<object> {
    this.logger.log(`Change password request with reset token: ${reset_token}`);

    const user = await this.userRepository.findOne({
      where: { resetToken: reset_token },
    });
    if (!user) {
      this.logger.error(`User not found with reset token: ${reset_token}`);
      return CHANGE_PASSWORD_RESPONSES.USER_NOT_FOUND;
    }

    if (user.resetTokenExpires < new Date()) {
      this.logger.error(
        `Reset token expired for user with reset token: ${reset_token}`,
      );
      return CHANGE_PASSWORD_RESPONSES.TOKEN_EXPIRED;
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.resetToken = '';
    user.resetTokenExpires = null;

    await this.userRepository.save(user);

    this.logger.log(
      `Password has been reset successfully for user with reset token: ${reset_token}`,
    );
    return CHANGE_PASSWORD_RESPONSES.PASSWORD_RESET_SUCCESS;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<object> {
    this.logger.log(
      `Reset password request for user ID: ${resetPasswordDto.userId}`,
    );

    const user = await this.userRepository.findOne({
      where: { id: resetPasswordDto.userId },
    });
    if (!user) {
      this.logger.error(`User not found with ID: ${resetPasswordDto.userId}`);
      return RESET_PASSWORD_RESPONSES.USER_NOT_FOUND;
    }
    if (!user.isActive) {
      this.logger.error(
        `User account is inactive for user ID: ${resetPasswordDto.userId}`,
      );
      return RESET_PASSWORD_RESPONSES.USER_NOT_ACTIVE;
    }
    const isOldPasswordValid = await bcrypt.compare(
      resetPasswordDto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      this.logger.error(
        `Invalid old password for user ID: ${resetPasswordDto.userId}`,
      );
      return RESET_PASSWORD_RESPONSES.INVALID_OLD_PASSWORD;
    }
    const updatedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.userRepository.update(user.id, { password: updatedPassword });

    this.logger.log(
      `Password reset successfully for user ID: ${resetPasswordDto.userId}`,
    );
    return RESET_PASSWORD_RESPONSES.PASSWORD_RESET_SUCCESS;
  }

  async validateUser(userId: number, accessToken: string): Promise<boolean> {
    this.logger.log(
      `Validating user with ID: ${userId} and access token: ${accessToken}`,
    );

    try {
      const session = await this.userSessionRepository.findOne({
        where: { user: { id: userId }, token: accessToken },
      });

      if (!session || session.expiresAt < new Date()) {
        this.logger.warn(`Invalid or expired session for user ID: ${userId}`);
        return false;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user || !user.isActive) {
        this.logger.warn(`Invalid or inactive user with ID: ${userId}`);
        return false;
      }

      this.logger.log(`User validated successfully with ID: ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Validation failed for user ID: ${userId} with error: ${error.message}`,
      );
      return false;
    }
  }

  async logout(userId: number, token: string): Promise<object> {
    this.logger.log(
      `Logout request for user ID: ${userId} with token: ${token}`,
    );

    try {
      // Validate if the user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.error(`User not found with ID: ${userId}`);
        return LOGOUT_RESPONSES.USER_NOT_FOUND(userId);
      }

      const session = await this.userSessionRepository.findOne({
        where: { user: { id: userId }, token },
      });

      if (!session) {
        this.logger.error(
          `Invalid or expired session for user ID: ${userId} with token: ${token}`,
        );
        return LOGOUT_RESPONSES.INVALID_SESSION(userId, token);
      }

      await this.userSessionRepository.delete({ token: session.token });

      this.logger.log(
        `Logout successful for user ID: ${userId} with token: ${token}`,
      );
      return LOGOUT_RESPONSES.LOGOUT_SUCCESS(userId);
    } catch (error) {
      this.logger.error(
        `Logout failed for user ID: ${userId} with token: ${token} with error: ${error.message}`,
      );
      return error;
    }
  }
}
