import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InviteUserDto } from 'dto/inviteUser.dto';
import { User } from 'entities/user.entity';
import { UserContactDetails } from 'entities/user_contact_details.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/service/mail.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/dto/login.dto';
import { LoggerService } from 'src/service/logger.service';
import { UserSessions } from 'entities/user_sessions.entity';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from 'dto/forgotPassword.dto';
import { ChangePasswordDto } from 'dto/recoverPassword.dto';
import { ResetPasswordDto } from 'dto/resetPassword.dto';
import { UserProperties } from 'src/entities/user_properties.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserContactDetails)
    private readonly userContactRepository: Repository<UserContactDetails>,
    @InjectRepository(UserSessions)
    private readonly userSessionRepository: Repository<UserSessions>,
    @InjectRepository(UserProperties)
    private readonly userPropertyRepository: Repository<UserProperties>,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async inviteUser(inviteUserDto: InviteUserDto): Promise<{ message: string }> {
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
      created_by,
      updated_by,
      userPropertyDetails,
    } = inviteUserDto;

    this.logger.log(`Inviting user with email: ${email}`);

    const existingUserEmail = await this.userContactRepository.findOne({
      where: { contactValue: email, contactType: 'email' },
    });
    if (existingUserEmail) {
      this.logger.error(`Email already exists: ${email}`);
      throw new ConflictException('Email already exists');
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
      createdBy: created_by,
      updatedBy: updated_by,
      role: { id: roleId },
    });

    const userContacts = [
      {
        user,
        contactType: 'email',
        contactValue: email,
      },
      {
        user,
        contactType: 'phone',
        contactValue: phoneNumber,
      },
    ];

    for (const contact of userContacts) {
      const userContact = this.userContactRepository.create(contact);
      await this.userContactRepository.save(userContact);
    }

    const userProperty = this.userPropertyRepository.create({
      ...userPropertyDetails,
      user,
    });

    await this.userPropertyRepository.save(userProperty);
    await this.userRepository.save(user);

    const loginLink = `http://fraxionedOwners.com/login`;

    await this.mailService.sendMail(
      email,
      'You are invited!',
      `Hello ${firstName},\n\nYou have been invited to our platform. Please use the following link to login: ${loginLink}\n\nYour temporary password is: ${tempPassword}\n\nBest regards,\nYour Team`,
    );

    this.logger.log(`Invite sent successfully to ${email}`);
    return { message: 'Invite sent successfully' };
  }

  async login(loginDto: LoginDto): Promise<{
    message: string;
    user: Partial<User>;
    session: { token: string; expires_at: Date };
  }> {
    const { email, password } = loginDto;
    this.logger.log(`User attempting to login with email: ${email}`);

    const userEmail = await this.userContactRepository.findOne({
      where: { contactValue: email, contactType: 'email' },
      relations: ['user'],
    });

    if (!userEmail) {
      this.logger.error(`User not found with email: ${email}`);
      throw new NotFoundException('User not found');
    }

    const user = userEmail.user;

    if (!user) {
      this.logger.error(`User entity not found for email: ${email}`);
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      this.logger.error(`User is not Active: ${email}`);
      throw new UnauthorizedException('User is not Active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.error(`Invalid credentials for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.error(`User account is inactive for email: ${email}`);
      throw new UnauthorizedException('The user account is currently inactive');
    }

    user.lastLoginTime = new Date();
    await this.userRepository.save(user);

    let session = await this.userSessionRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!session) {
      session = this.userSessionRepository.create({
        user,
        token: crypto.randomBytes(50).toString('hex'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    } else {
      session.token = crypto.randomBytes(50).toString('hex');
      session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await this.userSessionRepository.save(session);

    const { ...userDetails } = user;

    this.logger.log(`Login successful for email: ${email}`);
    return {
      message: 'Login successful',
      user: userDetails,
      session: { token: session.token, expires_at: session.expiresAt },
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const userEmail = await this.userContactRepository.findOne({
      where: { contactValue: forgotPasswordDto.email, contactType: 'email' },
      relations: ['user'],
    });

    if (!userEmail || !userEmail.user) {
      throw new NotFoundException(
        'The account associated with this user was not found',
      );
    }

    const user = userEmail.user;
    user.resetToken = crypto.randomBytes(50).toString('hex').slice(0, 100);
    user.resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    await this.userRepository.save(user);

    const link = `http://fraxioned.com/reset-password?resetToken=${user.resetToken}`;

    const subject = 'Password Reset Request';
    const text = `To reset your password, please click the following link: ${link}`;

    await this.mailService.sendMail(userEmail.contactValue, subject, text);

    return { message: 'Password reset email sent successfully' };
  }

  async changePassword(
    reset_token: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { resetToken: reset_token },
    });
    if (!user) {
      throw new NotFoundException(
        'The account associated with this user was not found',
      );
    }

    if (user.resetTokenExpires < new Date()) {
      throw new BadRequestException('The password reset token has expired');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.resetToken = '';
    user.resetTokenExpires = null;

    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: resetPasswordDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        'The account associated with this user was not found',
      );
    }
    if (!user.isActive) {
      throw new UnauthorizedException('The user account is currently inactive');
    }
    const isOldPasswordValid = await bcrypt.compare(
      resetPasswordDto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('The provided old password is incorrect');
    }
    const updatedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.userRepository.update(user.id, { password: updatedPassword });
    return { message: 'Password reset successfully' };
  }

  async validateUser(userId: number, accessToken: string): Promise<boolean> {
    try {
      const session = await this.userSessionRepository.findOne({
        where: { user: { id: userId }, token: accessToken },
      });

      if (!session || session.expiresAt < new Date()) {
        return false;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user || !user.isActive) {
        return false;
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        'The provided user ID or access token is invalid',
      );
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      const session = await this.userSessionRepository.findOne({
        where: { token },
      });

      if (!session) {
        throw new UnauthorizedException(
          'The session has expired or is invalid',
        );
      }

      await this.userSessionRepository.delete({ token: session.token });

      return { message: 'Logout successful' };
    } catch (error) {
      throw error;
    }
  }
}
