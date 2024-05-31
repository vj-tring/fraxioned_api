import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { InviteDTO } from './dto/invite.dto';
import { RegisterDTO } from './dto/register.dto';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async sendInvite(inviteDTO: InviteDTO) {
    const existingUser = await this.userRepository.findOne({ where: { email: inviteDTO.email } });
    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    const user = new User();
    user.email = inviteDTO.email;
    user.roleId = inviteDTO.roleId;
    user.inviteToken = Math.random().toString(36).substr(2, 10);

    const randomPassword = Math.random().toString(36).slice(-8);
    const saltRounds = 10;
    user.password = await bcrypt.hash(randomPassword, saltRounds);

    await this.userRepository.save(user);

    const subject = 'Invitation to join our platform';
    const text = `Hello! You have been invited to join our platform. Please click on the following link to complete your registration: http://your-website.com/register?inviteToken=${user.inviteToken}
                  Your temporary password is: ${randomPassword}`;

    await this.mailService.sendMail(inviteDTO.email, subject, text);
  }

  async register(registerDTO: RegisterDTO) {
    const user = await this.userRepository.findOne({ where: { inviteToken: registerDTO.inviteToken } });
    if (!user) {
      throw new HttpException('Invalid invite token', HttpStatus.BAD_REQUEST);
    }

    user.username = registerDTO.username;
    user.phone = registerDTO.phone;
    user.password = await bcrypt.hash(registerDTO.password, 10);
    user.inviteToken = null;

    await this.userRepository.save(user);

    return { message: 'User registered successfully' };
  }
}
