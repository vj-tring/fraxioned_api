import { Logger as NestLogger } from '@nestjs/common';
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import * as winston from 'winston';

export class QueryLogger implements TypeOrmLogger {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
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

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const message = `Query: ${query}${parameters ? ` Parameters: ${JSON.stringify(parameters)}` : ''}`;
    this.logger.info(message);
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const message = `Query Failed: ${query} Error: ${error}${parameters ? ` Parameters: ${JSON.stringify(parameters)}` : ''}`;
    this.logger.error(message);
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const message = `Query is slow: ${query} Execution time: ${time}ms${parameters ? ` Parameters: ${JSON.stringify(parameters)}` : ''}`;
    this.logger.warn(message);
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.logger.info(`Schema Build: ${message}`);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    this.logger.info(`Migration: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
        this.logger.log('info', message);
        break;
      case 'info':
        this.logger.log('info', message);
        break;
      case 'warn':
        this.logger.log('warn', message);
        break;
    }
  }
}
