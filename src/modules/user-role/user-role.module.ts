import { Module } from '@nestjs/common';
import { RoleModule } from '../role/role.module';
import { LoggerModule } from 'modules/Logger/logger.module';

@Module({
  imports: [RoleModule, LoggerModule],
})
export class UserRoleModule {}
