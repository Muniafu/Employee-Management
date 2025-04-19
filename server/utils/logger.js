import winston from 'winston';
import { env } from '../config/env.js';
import { DateTime } from 'luxon';
import logger, { logSecurityEvent } from '../utils/logger.js';

logger.info('Server started on port 5000');
logSecurityEvent('Failed login attempt', null, { ip: req.ip });

// Custom log format with timestamp
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

// Configure transports based on environment
const transports = [];
if (env.isProduction) {
  transports.push(
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  );
}

// Main logger instance
const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => DateTime.now().toISO()
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Morgan middleware for HTTP request logging
export const httpLogger = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Utility methods
export const logError = (error, context = {}) => {
  logger.error(error.message, { 
    stack: error.stack,
    ...context 
  });
};

export const logSecurityEvent = (event, user, metadata = {}) => {
  logger.warn(`SECURITY: ${event}`, {
    user: user._id || 'anonymous',
    ip: metadata.ip,
    userAgent: metadata.userAgent
  });
};

export default logger;