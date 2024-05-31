import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/user/user.entity';
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
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]), 
  ],
  providers: [MailConfig],
  exports: [TypeOrmModule], 
})
export class DatabaseModule {}
