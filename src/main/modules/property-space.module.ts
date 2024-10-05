import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { UserModule } from './user.module';
import { PropertySpaceService } from '../service/property-space.service';
import { PropertySpace } from '../entities/property-space.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertySpace, User]),
    LoggerModule,
    UserModule,
    AuthenticationModule,
  ],
  controllers: [],
  providers: [PropertySpaceService],
  exports: [PropertySpaceService],
})
export class PropertySpaceModule {}
