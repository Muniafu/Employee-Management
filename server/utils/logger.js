const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { format, transports } = winston;
const { combine, timestamp, printf, colorize, errors, metadata } = format;

// Custom log format with emoji support
const logFormat = printf(({ level, message, timestamp, stack, metadata }) => {
  const emoji = {
    error: '❌',
    warn: '⚠️',
    info: 'ℹ️',
    debug: '🐛',
    http: '🌐'
  }[level] || '📝';
  
  const metaString = metadata && Object.keys(metadata).length 
    ? `\n${JSON.stringify(metadata, null, 2)}` 
    : '';
    
  return `${timestamp} ${emoji} [${level.toUpperCase()}]: ${stack || message}${metaString}`;
});

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Base transport configuration
const baseTransports = [
  new transports.Console({
    format: combine(
      colorize(),
      logFormat
    ),
    level: logLevel
  })
];

// Production-specific transports
if (isProduction) {
  baseTransports.push(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '100m',
      maxFiles: '30d',
      format: combine(
        timestamp(),
        errors({ stack: true }),
        logFormat
      )
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '100m',
      maxFiles: '90d',
      level: 'error',
      format: combine(
        timestamp(),
        errors({ stack: true }),
        logFormat
      )
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    logFormat
  ),
  transports: baseTransports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '30d'
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '30d'
    })
  ]
});

// Add console for exceptions/rejections in development
if (!isProduction) {
  logger.exceptions.handle(
    new transports.Console({
      format: combine(colorize(), logFormat)
    })
  );
  
  logger.rejections.handle(
    new transports.Console({
      format: combine(colorize(), logFormat)
    })
  );
}

// Simple method API for backward compatibility
const simpleLogger = {
  info: (message, meta) => logger.info(message, meta),
  warn: (message, meta) => logger.warn(message, meta),
  error: (message, meta) => logger.error(message, meta),
  debug: (message, meta) => logger.debug(message, meta),
  http: (message, meta) => logger.http(message, meta)
};

// HTTP logger stream for Morgan
const httpLoggerStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = {
  logger,
  httpLoggerStream,
  ...simpleLogger
};