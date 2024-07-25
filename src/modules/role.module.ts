import { Module } from '@nestjs/common';
import { RoleService } from 'src/service/role.service';
import { Role } from 'entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/modules/logger.module';
import { RoleController } from 'controllers/role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), LoggerModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
