import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { PropertySpace } from '../entities/property-space.entity';
import { PropertySpaceController } from '../controller/property-space.controller';
import { PropertySpaceService } from '../service/property-space.service';
import { PropertiesModule } from './properties.module';
import { UserModule } from './user.module';
import { SpaceModule } from './space.module';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertySpace, User]),
    LoggerModule,
    AuthenticationModule,
    UserModule,
    PropertiesModule,
    forwardRef(() => SpaceModule),
  ],
  controllers: [PropertySpaceController],
  providers: [PropertySpaceService],
  exports: [PropertySpaceService],
})
export class PropertySpaceModule {}