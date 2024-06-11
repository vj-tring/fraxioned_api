import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/db.config';
import { User } from '../modules/user/user.entity';
import { Session } from '../modules/user/session.entity';
import { Role } from '../modules/user-role/role/role.entity';
import { UserRole } from '../modules/user-role/user-role.entity';
import { InviteUser } from '../modules/user/invite-user.entity';
import { MailConfig } from '../modules/mail/mail.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      entities: [User, Session, Role, UserRole, InviteUser],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Session, Role, UserRole, InviteUser]),
  ],
  providers: [MailConfig],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
