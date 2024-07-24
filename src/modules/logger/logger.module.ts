import { Module } from '@nestjs/common';
import { LoggerService } from '../../service/Logger/logger.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
