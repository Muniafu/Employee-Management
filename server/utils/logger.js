import winston from 'winston';
import { fileURLToPath } from 'url';
import path from 'path';
import config from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  silly: 5
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
  silly: 'blue'
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    info => `${info.timestamp} [${info.level}] ${info.message}`
  )
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    )
  }),
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format
  }),
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/all.log'),
    format
  })
];

const logger = winston.createLogger({
  level: config.logs.level,
  levels,
  format,
  transports
});

// Morgan stream for HTTP request logging
export const morganStream = {
  write: message => logger.http(message.trim())
};

// Custom logging methods
export const log = {
  error: (message, meta) => logger.error(message, meta),
  warn: (message, meta) => logger.warn(message, meta),
  info: (message, meta) => logger.info(message, meta),
  http: (message, meta) => logger.http(message, meta),
  debug: (message, meta) => logger.debug(message, meta),
  silly: (message, meta) => logger.silly(message, meta)
};

export default logger;