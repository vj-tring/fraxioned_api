import { QueryLogger } from 'src/main/service/query-logger';
import { createLogger } from 'src/main/config/logger.config';
import winston from 'winston';

jest.mock('src/main/config/logger.config');

describe('QueryLogger', () => {
  let queryLogger: QueryLogger;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
    } as unknown as winston.Logger;

    (createLogger as jest.Mock).mockReturnValue(mockLogger);
    queryLogger = new QueryLogger();
  });

  it('should create an instance of QueryLogger', () => {
    expect(queryLogger).toBeDefined();
    expect(createLogger).toHaveBeenCalled();
  });

  it('should log query', () => {
    const query = 'SELECT * FROM users';
    const parameters = [1, 2, 3];
    const expectedMessage = `Query: ${query} Parameters: ${JSON.stringify(parameters)}`;

    queryLogger.logQuery(query, parameters);

    expect(mockLogger.info).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log query without parameters', () => {
    const query = 'SELECT * FROM users';
    const expectedMessage = `Query: ${query}`;

    queryLogger.logQuery(query);

    expect(mockLogger.info).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log query error', () => {
    const error = 'Syntax error';
    const query = 'SELECT * FROM users';
    const parameters = [1, 2, 3];
    const expectedMessage = `Query Failed: ${query} Error: ${error} Parameters: ${JSON.stringify(parameters)}`;

    queryLogger.logQueryError(error, query, parameters);

    expect(mockLogger.error).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log query error without parameters', () => {
    const error = 'Syntax error';
    const query = 'SELECT * FROM users';
    const expectedMessage = `Query Failed: ${query} Error: ${error}`;

    queryLogger.logQueryError(error, query);

    expect(mockLogger.error).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log slow query', () => {
    const time = 500;
    const query = 'SELECT * FROM users';
    const parameters = [1, 2, 3];
    const expectedMessage = `Query is slow: ${query} Execution time: ${time}ms Parameters: ${JSON.stringify(parameters)}`;

    queryLogger.logQuerySlow(time, query, parameters);

    expect(mockLogger.warn).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log slow query without parameters', () => {
    const time = 500;
    const query = 'SELECT * FROM users';
    const expectedMessage = `Query is slow: ${query} Execution time: ${time}ms`;

    queryLogger.logQuerySlow(time, query);

    expect(mockLogger.warn).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log schema build', () => {
    const message = 'Schema build completed';
    const expectedMessage = `Schema Build: ${message}`;

    queryLogger.logSchemaBuild(message);

    expect(mockLogger.info).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log migration', () => {
    const message = 'Migration completed';
    const expectedMessage = `Migration: ${message}`;

    queryLogger.logMigration(message);

    expect(mockLogger.info).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log with level log', () => {
    const message = 'This is a log message';

    queryLogger.log('log', message);

    expect(mockLogger.log).toHaveBeenCalledWith('info', message);
  });

  it('should log with level info', () => {
    const message = 'This is an info message';

    queryLogger.log('info', message);

    expect(mockLogger.log).toHaveBeenCalledWith('info', message);
  });

  it('should log with level warn', () => {
    const message = 'This is a warn message';

    queryLogger.log('warn', message);

    expect(mockLogger.log).toHaveBeenCalledWith('warn', message);
  });
});
