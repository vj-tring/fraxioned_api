import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { InviteUser } from './invite-user.entity';
import Session from './session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session, InviteUser])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
