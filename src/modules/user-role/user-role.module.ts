import { Module } from '@nestjs/common';
import { RoleModule } from './role/role.module';
import { LoggerModule } from '@logger/logger.module';

@Module({
  imports: [RoleModule, LoggerModule,],
})
export class UserRoleModule {}
