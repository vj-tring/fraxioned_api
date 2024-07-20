import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { MailModule } from '@mail/mail.module';
import { User } from '@user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MailModule, LoggerModule],
  providers: [ContactUsService],
  controllers: [ContactUsController],
})
export class ContactUsModule {}
