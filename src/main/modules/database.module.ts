import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from '../database/typeorm.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    TypeOrmModule.forFeature([]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
