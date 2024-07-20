import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { Session } from '@user/entities/session.entity';
import { MailModule } from '@mail/mail.module';
import { Role } from '@user-role/role/role.entity';
import { UserRole } from '@user-role/user-role.entity';
import { InviteUser } from '@user/entities/invite-user.entity';
import { LoggerModule } from '@logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, Role, UserRole, InviteUser]),
    MailModule,
    LoggerModule,
  ],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
