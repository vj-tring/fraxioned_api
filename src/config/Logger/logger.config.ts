import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const dailyRotateFileTransportError = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '7d',
});

export const dailyRotateFileTransportCombined = new DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
});

export const dailyRotateFileTransportExceptions = new DailyRotateFile({
  filename: 'logs/exceptions-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
});

export const createLogger = () =>
  winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}] ${message}`;
      }),
    ),
    transports: [
      new winston.transports.Console(),
      dailyRotateFileTransportError,
      dailyRotateFileTransportCombined,
    ],
    exceptionHandlers: [dailyRotateFileTransportExceptions],
  });
