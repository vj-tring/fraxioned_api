import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { PropertySpace } from '../entities/property-space.entity';
import { PropertySpaceController } from '../controller/property-space.controller';
import { PropertySpaceService } from '../service/property-space.service';
import { PropertiesModule } from './properties.module';
import { UserModule } from './user.module';
import { SpaceModule } from './space.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertySpace]),
    LoggerModule,
    AuthenticationModule,
    UserModule,
    SpaceModule,
    PropertiesModule,
  ],
  controllers: [PropertySpaceController],
  providers: [PropertySpaceService],
  exports: [PropertySpaceService],
})
export class PropertySpaceModule {}
