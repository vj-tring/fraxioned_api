import { Module } from '@nestjs/common';
import { RoleController } from '../../controller/Role/role.controller';
import { RoleService } from '../../service/Role/role.service';
import { Role } from 'entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'modules/Logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), LoggerModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
