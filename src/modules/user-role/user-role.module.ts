import { Module } from '@nestjs/common';
import { RoleModule } from 'modules/role/role.module';
import { LoggerModule } from 'modules/logger/logger.module';

@Module({
  imports: [RoleModule, LoggerModule],
})
export class UserRoleModule {}
