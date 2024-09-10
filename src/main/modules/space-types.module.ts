import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceTypes } from '../entities/space-types.entity';
import { Space } from '../entities/space.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { SpaceTypesController } from '../controller/space-types.controller';
import { SpaceTypesService } from '../service/space-types.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpaceTypes, Space]),
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [SpaceTypesController],
  providers: [SpaceTypesService],
})
export class SpaceTypesModule {}
