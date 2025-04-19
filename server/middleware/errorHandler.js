import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../config/constants.js';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (err, req, res, next) => {
  // Default values
  err.statusCode = err.statusCode || HTTP_STATUS.SERVER_ERROR;
  err.status = err.status || 'error';

  // Log operational errors
  if (err.isOperational) {
    logger.error('Operational Error:', err.message);
  } else {
    // Log programming/unknown errors
    logger.error('🚨 Unexpected Error:', err);
    logger.error('Error Stack:', err.stack);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return handleValidationError(err, res);
  }

  if (err.code === 11000) {
    return handleDuplicateFieldError(err, res);
  }

  if (err.name === 'JsonWebTokenError') {
    return handleJWTError(res);
  }

  if (err.name === 'TokenExpiredError') {
    return handleJWTExpiredError(res);
  }

  // Generic error response
  const errorResponse = {
    success: false,
    error: err.message || 'Something went wrong'
  };

  // Development-only details
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.fullError = err;
  }

  res.status(err.statusCode).json(errorResponse);
};

// Specialized error handlers
const handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    error: message
  });
};

const handleDuplicateFieldError = (err, res) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} already exists. Please use another value`;
  res.status(HTTP_STATUS.CONFLICT).json({
    success: false,
    error: message
  });
};

const handleJWTError = (res) => {
  res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    error: 'Invalid token. Please log in again'
  });
};

const handleJWTExpiredError = (res) => {
  res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    error: 'Your token has expired. Please log in again'
  });
};

// 404 Not Found handler
export const notFound = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Can't find ${req.originalUrl} on this server`
  });
};