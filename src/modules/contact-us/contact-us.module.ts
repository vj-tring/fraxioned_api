import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { MailModule } from '@mail/mail.module';
import { User } from '@user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MailModule],
  providers: [ContactUsService],
  controllers: [ContactUsController],
})
export class ContactUsModule {}
