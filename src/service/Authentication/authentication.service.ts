import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InviteUserDto } from '../../dto/Authentication/invite-user.dto';
import { User } from 'entities/user.entity';
import { UserAddressDetails } from 'entities/user_address_details.entity';
import { UserEmailDetails } from 'entities/user_email_details.entity';
import { UserPhoneDetails } from 'entities/user_phone_details.entity';
import { UserRole } from 'entities/user_role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/service/Mail/mail.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../dto/Authentication/login.dto';
import { LoggerService } from 'src/service/Logger/logger.service';
import { Sessions } from 'entities/sessions.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAddressDetails)
    private readonly userAddressRepository: Repository<UserAddressDetails>,
    @InjectRepository(UserEmailDetails)
    private readonly userEmailRepository: Repository<UserEmailDetails>,
    @InjectRepository(UserPhoneDetails)
    private readonly userPhoneRepository: Repository<UserPhoneDetails>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Sessions)
    private readonly sessionRepository: Repository<Sessions>,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async inviteUser(inviteUserDto: InviteUserDto) {
      const {
      email,
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      state,
      city,
      zip,
      phoneNumber,
      roleId,
      created_by,
      updated_by
    } = inviteUserDto;

    this.logger.log(`Inviting user with email: ${email}`);

    const existingUserEmail = await this.userEmailRepository.findOne({
      where: { email_id: email },
    });
    if (existingUserEmail) {
      this.logger.error(`Email already exists: ${email}`);
      throw new ConflictException('Email already exists');
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = this.userRepository.create({
      first_name: firstName,
      last_name: lastName,
      password: hashedPassword,
      is_active: 1,
      created_by: created_by,
      updated_by: updated_by
    });

    await this.userRepository.save(user);

    const userAddress = this.userAddressRepository.create({
      user,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      state,
      city,
      zip,
    });

    await this.userAddressRepository.save(userAddress);

    const userEmail = this.userEmailRepository.create({
      user,
      email_id: email,
    });

    await this.userEmailRepository.save(userEmail);

    const userPhone = this.userPhoneRepository.create({
      user,
      phone_number: phoneNumber,
    });

    await this.userPhoneRepository.save(userPhone);

    const userRole = this.userRoleRepository.create({
      user,
      role: { id: roleId } as any,
    });

    await this.userRoleRepository.save(userRole);

    const loginLink = `http://fraxionedOwners.com/login`;

    await this.mailService.sendMail(
      email,
      'You are invited!',
      `Hello ${firstName},\n\nYou have been invited to our platform. Please use the following link to login: ${loginLink}\n\nYour temporary password is: ${tempPassword}\n\nBest regards,\nYour Team`,
    );

    this.logger.log(`Invite sent successfully to ${email}`);
    return { message: 'Invite sent successfully' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    this.logger.log(`User attempting to login with email: ${email}`);

    const userEmail = await this.userEmailRepository.findOne({
      where: { email_id: email },
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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.error(`Invalid credentials for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      this.logger.error(`User account is inactive for email: ${email}`);
      throw new UnauthorizedException('The user account is currently inactive');
    }

    user.last_login_time = new Date();
    await this.userRepository.save(user);
  
    let session = await this.sessionRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!session) {
      session = this.sessionRepository.create({
        user,
        token: crypto.randomBytes(50).toString('hex'),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    } else {
      session.token = crypto.randomBytes(50).toString('hex');
      session.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await this.sessionRepository.save(session);

    const { password: userPassword, ...userDetails } = user;

    this.logger.log(`Login successful for email: ${email}`);
    return {
      message: 'Login successful',
      user: userDetails,
      session: { token: session.token, expires_at: session.expires_at },
    };
  }

  async validateUser(userId: number, accessToken: string): Promise<boolean> {
    try {
      const session = await this.sessionRepository.findOne({
        where: { user: { id: userId }, token: accessToken },
      });

      if (!session || session.expires_at < new Date()) {
        return false;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user || !user.is_active) {
        return false;
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        'The provided user ID or access token is invalid',
      );
    }
  }
}
