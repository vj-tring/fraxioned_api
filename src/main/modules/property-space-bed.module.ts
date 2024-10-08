import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { UserModule } from './user.module';
import { PropertySpaceBedController } from '../controller/property-space-bed.controller';
import { PropertySpaceBed } from '../entities/property-space-bed.entity';
import { PropertySpaceModule } from './property-space.module';
import { SpaceBedTypeModule } from './space-bed-type.module';
import { SpaceBedType } from '../entities/space-bed-type.entity';
import { PropertySpaceBedService } from '../service/property-space-bed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertySpaceBed, SpaceBedType, User]),
    LoggerModule,
    UserModule,
    AuthenticationModule,
    PropertySpaceModule,
    SpaceBedTypeModule,
  ],
  controllers: [PropertySpaceBedController],
  providers: [PropertySpaceBedService],
  exports: [PropertySpaceBedService],
})
export class PropertySpaceBedModule {}
