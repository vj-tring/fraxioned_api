import { Module } from '@nestjs/common';
import { AuthenticationModule } from './modules/authentication.module';
import { MailModule } from 'src/modules/mail.module';
import { UserRoleModule } from 'src/modules/user-role.module';
import { RoleModule } from 'src/modules/role.module';
import { DatabaseModule } from './modules/database.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './database/typeorm.config';

@Module({
  imports: [
    AuthenticationModule,
    MailModule,
    RoleModule,
    UserRoleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    DatabaseModule,
  ],
})
export class AppModule {}
