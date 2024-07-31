import { Module } from '@nestjs/common';
import { DatabaseModule } from './main/modules/database.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidaysModule } from 'modules/holidays.module';
import { PropertiesModule } from './main/modules/properties.module';
import { typeOrmConfigAsync } from './main/database/typeorm.config';
import { AuthenticationModule } from './main/modules/authentication.module';
import { RoleModule } from './main/modules/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    DatabaseModule,
    HolidaysModule,
    PropertiesModule,
    AuthenticationModule,
    RoleModule,
  ],
})
export class AppModule {}
