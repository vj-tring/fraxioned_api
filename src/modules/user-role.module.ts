import { Module } from '@nestjs/common';
import { RoleModule } from 'src/modules/role.module';
import { LoggerModule } from 'src/modules/logger.module';

@Module({
  imports: [RoleModule, LoggerModule],
})
export class UserRoleModule {}
