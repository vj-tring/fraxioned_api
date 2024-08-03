import { Module } from '@nestjs/common';
import { UsersService } from 'services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { User } from 'entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), LoggerModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
