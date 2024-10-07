import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { UserModule } from './user.module';
import { PropertySpaceBathroomController } from '../controller/property-space-bathroom.controller';
import { PropertySpaceBathroomService } from '../service/property-space-bathroom.service';
import { PropertySpaceBathroom } from '../entities/property-space-bathroom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PropertySpaceBathroom]),
    UserModule,
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [PropertySpaceBathroomController],
  providers: [PropertySpaceBathroomService],
})
export class PropertySpaceBathroomModule {}
