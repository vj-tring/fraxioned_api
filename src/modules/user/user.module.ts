import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { InviteUser } from './entities/invite-user.entity';
import Session from './entities/session.entity';
import { LoggerModule } from '@logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, InviteUser]),
    LoggerModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
