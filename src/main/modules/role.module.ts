import { Module } from '@nestjs/common';
import { RoleService } from 'src/main/service/role.service';
import { Role } from 'entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'modules/logger.module';
import { RoleController } from 'controllers/role.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User]), LoggerModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
