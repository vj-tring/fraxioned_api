import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { AuthenticationModule } from 'src/main/modules/authentication.module';
import { LoggerModule } from 'src/main/modules/logger.module';

@Module({
  imports: [AuthenticationModule, LoggerModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
