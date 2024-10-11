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
import { PropertySpaceBathroomModule } from './property-space-bathroom.module';
import { PropertySpaceBedModule } from './property-space-bed.module';
import { PropertySpaceAmenitiesModule } from './property-space-amenity.module';
import { PropertySpaceImageModule } from './property-space-image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertySpace]),
    LoggerModule,
    AuthenticationModule,
    UserModule,
    PropertiesModule,
    PropertySpaceImageModule,
    forwardRef(() => PropertySpaceBathroomModule),
    forwardRef(() => PropertySpaceBedModule),
    forwardRef(() => PropertySpaceAmenitiesModule),
    forwardRef(() => SpaceModule),
  ],
  controllers: [PropertySpaceController],
  providers: [PropertySpaceService],
  exports: [PropertySpaceService],
})
export class PropertySpaceModule {}
