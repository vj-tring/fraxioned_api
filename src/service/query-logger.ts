import { Logger as TypeOrmLogger } from 'typeorm';
import { createLogger } from 'src/config/logger.config';
import winston from 'winston';

export class QueryLogger implements TypeOrmLogger {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = createLogger();
  }

  logQuery(query: string, parameters?: unknown[]): void {
    const message = `Query: ${query}${parameters ? ` Parameters: ${JSON.stringify(parameters)}` : ''}`;
    this.logger.info(message);
  }

  logQueryError(error: string, query: string, parameters?: unknown[]): void {
    const message = `Query Failed: ${query} Error: ${error}${parameters ? ` Parameters: ${JSON.stringify(parameters)}` : ''}`;
    this.logger.error(message);
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[]): void {
    const message = `Query is slow: ${query} Execution time: ${time}ms${parameters ? ` Parameters: ${JSON.stringify(parameters)}` : ''}`;
    this.logger.warn(message);
  }

  logSchemaBuild(message: string): void {
    this.logger.info(`Schema Build: ${message}`);
  }

  logMigration(message: string): void {
    this.logger.info(`Migration: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: string): void {
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
