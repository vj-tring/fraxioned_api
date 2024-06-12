import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/db.config';
import { User } from '@user/user.entity';
import { Session } from '@user/session.entity';
import { Role } from '@user-role/role/role.entity';
import { UserRole } from '@user-role/user-role.entity';
import { InviteUser } from '@user/invite-user.entity';
import { MailConfig } from '@mail/mail.config';

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
