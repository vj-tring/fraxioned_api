import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/db.config';
import { User } from '@user/entities/user.entity';
import { Session } from '@user/entities/session.entity';
import { Role } from '@user-role/role/role.entity';
import { UserRole } from '@user-role/user-role.entity';
import { InviteUser } from '@user/entities/invite-user.entity';
import { MailConfig } from '@mail/mail.config';
import { QueryLogger } from '@logger/query-logger';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: true,
      logger: new QueryLogger(),
    }),
    TypeOrmModule.forFeature([User, Session, Role, UserRole, InviteUser]),
  ],
  providers: [MailConfig],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
