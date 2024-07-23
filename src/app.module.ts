import { Module } from '@nestjs/common';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MailModule } from '@mail/mail.module';
import { UserRoleModule } from '@user-role/user-role.module';
import { RoleModule } from '@user-role/role/role.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './database/config/typeorm.config';

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