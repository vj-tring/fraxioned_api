import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { UserModule } from './user.module';
import { SpaceBedTypeController } from '../controller/space-bed-type.controller';
import { SpaceBedTypeService } from '../service/space-bed-type.service';
import { SpaceBedType } from '../entities/space-bed-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpaceBedType, User]),
    LoggerModule,
    UserModule,
    AuthenticationModule,
  ],
  controllers: [SpaceBedTypeController],
  providers: [SpaceBedTypeService],
  exports: [SpaceBedTypeService],
})
export class SpaceBedTypeModule {}
