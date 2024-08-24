import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceTypes } from '../entities/space-types.entity';
import { Space } from '../entities/space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpaceTypes, Space])],
})
export class SpaceTypesModule {}
