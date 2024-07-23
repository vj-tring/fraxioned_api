import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from '@entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), LoggerModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
