  import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
  import * as winston from 'winston';

  @Injectable()
  export class LoggerService implements NestLoggerService {
    private readonly logger: winston.Logger;

    constructor() {
      this.logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message}) => {
              return `${timestamp} [${level}] ${message}`;
          }),
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ],
      });
    }

    log(message: string) {
      this.logger.info(message);
    }

    error(message: string) {
      this.logger.error(message);
    }

    warn(message: string) {
      this.logger.warn(message);
    }

    debug(message: string) {
      this.logger.debug(message);
    }

    verbose(message: string) {
      this.logger.verbose(message);
    }
  }
