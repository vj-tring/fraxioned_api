import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSessionService } from 'services/user-session.service';
import { UserSessionController } from 'controllers/user-session.controller';
import { UserSession } from 'entities/user-session.entity';
import { LoggerModule } from 'src/main/modules/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserSession]), LoggerModule],
  controllers: [UserSessionController],
  providers: [UserSessionService],
})
export class UserSessionModule {}
