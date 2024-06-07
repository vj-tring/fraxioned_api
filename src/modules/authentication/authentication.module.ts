import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Session } from '../user/session.entity';
import { MailModule } from '../mail/mail.module';
import { Role } from '../user-role/role/role.entity';
import { UserRole } from '../user-role/user-role.entity';
import { InviteUser } from '../user/invite-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session, Role, UserRole, InviteUser]), MailModule],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
