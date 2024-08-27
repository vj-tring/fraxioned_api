import { Module } from '@nestjs/common';
import { MaintenanceController } from '../controller/maintenance.controller';
import { MaintenanceService } from '../service/maintenance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceTicket } from '../entities/maintenance-ticket.entity';
import { User } from '../entities/user.entity';
import { UserContactDetails } from '../entities/user-contact-details.entity';
import { MailModule } from '../email/mail.module';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceTicket, User, UserContactDetails]),
    MailModule,
    LoggerModule,
    AuthenticationModule,
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}
