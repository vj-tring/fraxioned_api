import { Injectable } from '@nestjs/common';
import { InviteUserDto } from 'src/main/dto/requests/inviteUser.dto';
import { User } from 'src/main/entities/user.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/main/dto/requests/login.dto';
import { LoggerService } from 'src/main/service/logger.service';
import { UserSession } from 'src/main/entities/user-session.entity';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from 'src/main/dto/requests/forgotPassword.dto';
import { ChangePasswordDto } from 'src/main/dto/requests/recoverPassword.dto';
import { ResetPasswordDto } from 'src/main/dto/requests/resetPassword.dto';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import {
  LOGIN_RESPONSES,
  INVITE_USER_RESPONSES,
  FORGOT_PASSWORD_RESPONSES,
  CHANGE_PASSWORD_RESPONSES,
  RESET_PASSWORD_RESPONSES,
  LOGOUT_RESPONSES,
} from 'src/main/commons/constants/response-constants/auth.constant';
import { Role } from '../entities/role.entity';
import { Property } from '../entities/property.entity';
import { USER_RESPONSES } from '../commons/constants/response-constants/user.constant';
import { USER_PROPERTY_RESPONSES } from '../commons/constants/response-constants/user-property.constant';
import { ROLE_RESPONSES } from '../commons/constants/response-constants/role.constant';
import { MailService } from '../email/mail.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserContactDetails)
    private readonly userContactRepository: Repository<UserContactDetails>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(UserProperties)
    private readonly userPropertyRepository: Repository<UserProperties>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async inviteUser(inviteUserDto: InviteUserDto): Promise<object> {
    try {
      const {
        email,
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        state,
        country,
        city,
        zipcode,
        phoneNumber,
        roleId,
        createdBy,
        updatedBy,
        userPropertyDetails,
      } = inviteUserDto;

      this.logger.log(`Inviting user with email: ${email}`);

      const existingUserEmail = await this.userContactRepository.findOne({
        where: { contactValue: email, contactType: 'email' },
      });
      if (existingUserEmail) {
        this.logger.error(`Email already exists: ${email}`);
        return INVITE_USER_RESPONSES.EMAIL_EXISTS;
      }

      // Validate createdBy user
      const createdByUser = await this.userRepository.findOne({
        where: { id: createdBy },
      });
      if (!createdByUser) {
        this.logger.error(`CreatedBy user not found with ID: ${createdBy}`);
        return USER_RESPONSES.USER_NOT_FOUND(createdBy);
      }

      // Validate updatedBy user
      const updatedByUser = await this.userRepository.findOne({
        where: { id: updatedBy },
      });
      if (!updatedByUser) {
        this.logger.error(`UpdatedBy user not found with ID: ${updatedBy}`);
        return USER_RESPONSES.USER_NOT_FOUND(updatedBy);
      }

      // Validate role
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        this.logger.error(`Role not found with ID: ${roleId}`);
        return ROLE_RESPONSES.ROLE_NOT_FOUND(roleId);
      }

      // Validate property
      const propertyId = userPropertyDetails.propertyID;
      const userProperty = await this.propertyRepository.findOne({
        where: { id: propertyId },
      });
      if (!userProperty) {
        this.logger.error(`Property not found with ID: ${propertyId}`);
        return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(propertyId);
      }

      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const user = this.userRepository.create({
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        state,
        country,
        city,
        zipcode: zipcode,
        password: hashedPassword,
        isActive: true,
        createdBy: createdByUser.id,
        updatedBy: updatedByUser.id,
        role: role,
      });
      await this.userRepository.save(user);

      const userContacts = [
        {
          user,
          contactType: 'email',
          contactValue: email,
          createdBy: createdByUser,
          updatedBy: updatedByUser,
        },
        {
          user,
          contactType: 'phone',
          contactValue: phoneNumber,
          createdBy: createdByUser,
          updatedBy: updatedByUser,
        },
      ];

      for (const contact of userContacts) {
        const userContact = this.userContactRepository.create(contact);
        await this.userContactRepository.save(userContact);
      }

      const currentYear = new Date().getFullYear();
      const userPropertyEntities = [
        this.userPropertyRepository.create({
          ...userPropertyDetails,
          user,
          year: currentYear,
          createdBy: createdByUser,
          updatedBy: updatedByUser,
        }),
        this.userPropertyRepository.create({
          ...userPropertyDetails,
          user,
          year: currentYear + 1,
          createdBy: createdByUser,
          updatedBy: updatedByUser,
        }),
        this.userPropertyRepository.create({
          ...userPropertyDetails,
          user,
          year: currentYear + 2,
          createdBy: createdByUser,
          updatedBy: updatedByUser,
        }),
      ];

      for (const userPropertyEntity of userPropertyEntities) {
        await this.userPropertyRepository.save(userPropertyEntity);
      }

      const loginLink = `http://192.168.1.47:3002/login`;
      const subject = 'Welcome to Fraxioned';
      const template = './registration';
      const context = {
        name: firstName,
        username: email,
        password: tempPassword,
        link: loginLink,
      };

      await this.mailService.sendMail(email, subject, template, context);

      this.logger.log(`Invite sent successfully to ${email}`);
      return INVITE_USER_RESPONSES.INVITE_SUCCESS;
    } catch (error) {
      console.log(error);
    }
  }

  async login(loginDto: LoginDto): Promise<object> {
    const { email, password } = loginDto;
    this.logger.log(`User attempting to login with email: ${email}`);

    const userEmail = await this.userContactRepository.findOne({
      where: { contactValue: email, contactType: 'email' },
      relations: ['user'],
    });

    if (!userEmail || !userEmail.user) {
      this.logger.error(`User not found with email: ${email}`);
      return LOGIN_RESPONSES.USER_NOT_FOUND;
    }

    const user = await this.userRepository.findOne({
      where: { id: userEmail.user.id },
      relations: ['role'],
      select: { role: { id: true, roleName: true } },
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

    const { ...userDetails } = user;
    this.logger.log(`Login successful for email: ${email}`);
    return LOGIN_RESPONSES.LOGIN_SUCCESS(
      { ...userDetails, role: user.role },
      session,
    );
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<object> {
    this.logger.log(
      `Forgot password request for email: ${forgotPasswordDto.email}`,
    );

    const userEmail = await this.userContactRepository.findOne({
      where: { contactValue: forgotPasswordDto.email, contactType: 'email' },
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

    const resetLink = `http://192.168.1.47:3002/recover?resetToken=${user.resetToken}`;
    const email = userEmail.contactValue;
    const subject = 'Password Reset';
    const template = './reset-password';
    const context = {
      name: user.firstName,
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
