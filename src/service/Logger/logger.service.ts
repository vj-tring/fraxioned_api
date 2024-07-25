import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger } from 'src/config/Logger/logger.config';
import winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = createLogger();
  }

  log(message: string): void {
    this.logger.info(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  verbose(message: string): void {
    this.logger.verbose(message);
  }
}
