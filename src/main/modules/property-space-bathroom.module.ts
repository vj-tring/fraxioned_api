import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { UserModule } from './user.module';
import { PropertySpaceBathroomController } from '../controller/property-space-bathroom.controller';
import { PropertySpaceBathroomService } from '../service/property-space-bathroom.service';
import { PropertySpaceBathroom } from '../entities/property-space-bathroom.entity';
import { SpaceBathroomTypes } from '../entities/space-bathroom-types.entity';
import { PropertySpaceModule } from './property-space.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PropertySpaceBathroom, SpaceBathroomTypes]),
    UserModule,
    LoggerModule,
    AuthenticationModule,
    forwardRef(() => PropertySpaceModule),
  ],
  controllers: [PropertySpaceBathroomController],
  providers: [PropertySpaceBathroomService],
  exports: [PropertySpaceBathroomService],
})
export class PropertySpaceBathroomModule {}
