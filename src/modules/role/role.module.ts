import { Module } from '@nestjs/common';
import { RoleService } from 'services/Role/role.service';
import { Role } from 'entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'modules/logger/logger.module';
import { RoleController } from 'controllers/Role/role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), LoggerModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
