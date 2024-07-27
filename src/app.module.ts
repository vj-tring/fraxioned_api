import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './database/typeorm.config';
import { HolidaysModule } from './modules/holidays.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    DatabaseModule,
    HolidaysModule,
  ],
})
export class AppModule {}
