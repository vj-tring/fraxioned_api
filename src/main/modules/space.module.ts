import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from 'src/main/entities/space.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { SpaceController } from '../controller/space.controller';
import { SpaceService } from '../service/space.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Space, User]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [SpaceController],
  providers: [SpaceService],
})
export class SpaceModule {}
