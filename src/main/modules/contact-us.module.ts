import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserContactDetails } from '../entities/user-contact-details.entity';
import { MailModule } from '../email/mail.module';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { ContactUs } from '../entities/contact-us.entity';
import { ContactUsService } from '../service/contact-us.service';
import { ContactUsController } from '../controller/contact-us.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactUs, User, UserContactDetails]),
    MailModule,
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
