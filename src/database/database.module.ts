import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/user/user.entity';
import { Session } from '../modules/user/session.entity';
import { Role } from '../modules/user-role/role/role.entity';
import { UserRole } from '../modules/user-role/user-role.entity';
import { MailConfig } from '../modules/mail/mail.config';
import { InviteUser } from 'src/modules/user/invite-user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '192.168.1.113',
      port: 3306,
      username: 'admin',
      password: 'root',
      database: 'fraxioned',
      entities: [User, Session, Role, UserRole, InviteUser],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Session, Role, UserRole, InviteUser]),
  ],
  providers: [MailConfig],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
