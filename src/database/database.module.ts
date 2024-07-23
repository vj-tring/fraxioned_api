import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { User } from '@entities/user.entity';
import { Sessions } from '@entities/sessions.entity';
import { Role } from '@entities/role.entity';  
import { UserRole } from '@entities/user_role.entity';  

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    TypeOrmModule.forFeature([User, Sessions, Role, UserRole]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}