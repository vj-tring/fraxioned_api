import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [ContactUsService],
  controllers: [ContactUsController],
})
export class ContactUsModule {}
