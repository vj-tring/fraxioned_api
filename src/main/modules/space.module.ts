import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from 'src/main/entities/space.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { SpaceController } from '../controller/space.controller';
import { SpaceService } from '../service/space.service';
import { UserModule } from './user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Space]),
    LoggerModule,
    AuthenticationModule,
    UserModule,
  ],
  controllers: [SpaceController],
  providers: [SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
