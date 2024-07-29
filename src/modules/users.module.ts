import { Module } from '@nestjs/common';
import { UsersService } from 'src/service/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from 'src/controller/users.controller';
import { LoggerModule } from './logger.module';
import { Users } from 'src/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), LoggerModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
