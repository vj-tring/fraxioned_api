import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@user/entities/user.entity';
import { Session } from '@user/entities/session.entity';
import { Role } from '@user-role/role/role.entity';
import { UserRole } from '@user-role/user-role.entity';
import { InviteUser } from '@user/entities/invite-user.entity';
import { InviteDTO } from './dto/invite.dto';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { MailService } from '@mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoggerService } from '@logger/logger.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(InviteUser)
    private readonly inviteUserRepository: Repository<InviteUser>,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async sendInvite(inviteDTO: InviteDTO) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: inviteDTO.email },
      });
      if (existingUser) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }

      const existingInvite = await this.inviteUserRepository.findOne({
        where: { email: inviteDTO.email },
      });
      if (existingInvite) {
        throw new HttpException(
          'Invite already sent to this email',
          HttpStatus.BAD_REQUEST,
        );
      }

      const role = await this.roleRepository.findOne({
        where: { id: inviteDTO.roleId },
      });

      if (!role) {
        throw new HttpException('Invalid role ID', HttpStatus.BAD_REQUEST);
      }

      const inviteUser = new InviteUser();
      inviteUser.email = inviteDTO.email;
      inviteUser.roleId = inviteDTO.roleId;
      inviteUser.inviteToken = crypto
        .randomBytes(50)
        .toString('hex')
        .slice(0, 100);
      inviteUser.inviteTokenExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );
      inviteUser.invitedBy = inviteDTO.invitedBy;

      await this.inviteUserRepository.save(inviteUser);

      const subject = 'Invitation to join our platform';
      const text = `Hello! You have been invited to join our platform. Please click on the following link to complete your registration: http://localhost:3000/register?inviteToken=${inviteUser.inviteToken}
                    NOTE: this token is valid for only 24 hours`;

      await this.mailService.sendMail(inviteDTO.email, subject, text);
      this.logger.log(`Sending Invite To ${inviteDTO.email}........`);
      this.logger.log(`Invite sent to ${inviteDTO.email}`);
    } catch (error) {
      this.logger.error(error.stack);
      throw error;
    }
  }

  async register(registerDTO: RegisterDTO) {
    try {
      const inviteUserPhone = await this.userRepository.findOne({
        where: { phone: registerDTO.phone },
      });

      if (inviteUserPhone) {
        throw new HttpException(
          'Phone number already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      const inviteUser = await this.inviteUserRepository.findOne({
        where: { inviteToken: registerDTO.inviteToken },
      });
      if (!inviteUser) {
        throw new HttpException('Invalid invite token', HttpStatus.BAD_REQUEST);
      }

      if (inviteUser.inviteTokenExpires < new Date()) {
        throw new HttpException(
          'Invite token has expired',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = new User();
      user.firstName = registerDTO.firstName;
      user.lastName = registerDTO.lastName;
      user.email = inviteUser.email;
      user.username = registerDTO.username;
      user.phone = registerDTO.phone;
      user.secondaryPhone = registerDTO.secondaryPhone;
      user.secondaryEmail = registerDTO.secondaryEmail;
      user.address1 = registerDTO.address1;
      user.address2 = registerDTO.address2;
      user.state = registerDTO.state;
      user.city = registerDTO.city;
      user.zip = registerDTO.zip;
      user.imageUrl = registerDTO.imageUrl;
      user.password = await bcrypt.hash(registerDTO.password, 10);
      user.isActive = true;

      const savedUser = await this.userRepository.save(user);

      const userRole = new UserRole();
      userRole.userId = savedUser.id;
      userRole.roleId = inviteUser.roleId;
      await this.userRoleRepository.save(userRole);

      await this.inviteUserRepository.remove(inviteUser);

      this.logger.log(`User registered with email ${user.email}`);
      return { message: 'User registered successfully' };
    } catch (error) {
      this.logger.error(error.stack);
      throw error;
    }
  }

  async login(loginDTO: LoginDTO) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDTO.email },
      });
      if (!user) {
        throw new HttpException(
          'Invalid email or password',
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (!user.isActive) {
        throw new HttpException(
          'User account is inactive. Please contact support.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const isPasswordValid = await bcrypt.compare(
        loginDTO.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new HttpException(
          'Invalid email or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      let session = await this.sessionRepository.findOne({
        where: { userId: user.id },
      });

      if (!session) {
        session = new Session();
        session.userId = user.id;
      }

      session.token = crypto.randomBytes(50).toString('hex');
      session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await this.sessionRepository.save(session);

      this.logger.log(`User ${user.email} logged in successfully`);
      return {
        message: 'Login successful',
        user: { id: user.id, email: user.email, username: user.username },
        session: { token: session.token, expiresAt: session.expiresAt },
      };
    } catch (error) {
      this.logger.error(error.stack);
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDTO: ForgotPasswordDTO) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: forgotPasswordDTO.email },
      });
      if (!user) {
        throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
      }

      user.resetToken = crypto.randomBytes(50).toString('hex').slice(0, 100);
      user.resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

      await this.userRepository.save(user);

      const resetUrl = `http://localhost:3000/reset-password?resetToken=${user.resetToken}`;

      const subject = 'Password Reset Request';
      const text = `Hello! To reset your password, please click the following link: ${resetUrl}
                    This link is valid for 1 hour.`;

      await this.mailService.sendMail(user.email, subject, text);
      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(error.stack);
      throw error;
    }
  }

  async resetPassword(resetToken: string, resetPasswordDTO: ResetPasswordDTO) {
    try {
      const user = await this.userRepository.findOne({ where: { resetToken } });
      if (!user || user.resetTokenExpires < new Date()) {
        throw new HttpException(
          'Invalid or expired reset token',
          HttpStatus.BAD_REQUEST,
        );
      }

      user.password = await bcrypt.hash(resetPasswordDTO.newPassword, 10);
      user.resetToken = null;
      user.resetTokenExpires = null;

      await this.userRepository.save(user);

      this.logger.log(`Password reset successfully for ${user.email}`);
      return { message: 'Password has been reset successfully' };
    } catch (error) {
      this.logger.error(error.stack);
      throw error;
    }
  }

  async logout(token: string) {
    try {
      const session = await this.sessionRepository.findOne({
        where: { token },
      });
      if (!session) {
        throw new HttpException(
          'Invalid session token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.sessionRepository.delete({ token });

      this.logger.log(`User logged out with token ${token}`);
      return { message: 'Logout successful' };
    } catch (error) {
      this.logger.error(error.stack);
      throw error;
    }
  }
}
