import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/user/user.entity';
import { Session } from '../modules/user/session.entity';
import { MailConfig } from '../modules/mail/mail.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Jroot',
      database: 'fraxioned',
      entities: [User, Session],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Session]), 
  ],
  providers: [MailConfig],
  exports: [TypeOrmModule], 
})
export class DatabaseModule {}
