const { APIError } = require('../utils/APIError');
const logger = require('../utils/logger');

/**
 * @desc    404 Not Found handler
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Next middleware function
 */
const notFoundHandler = (req, res, next) => {
  next(new APIError(`Can't find ${req.originalUrl} on this server`, 404));
};

/**
 * @desc    Async handler wrapper to catch promise rejections
 * @param   {Function} fn - Async route handler
 * @returns {Function} Wrapped middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * @desc    Global error handling middleware
 * @param   {Error} err - Error object
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // 1. Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // 2. Logging - server errors only
  if (err.statusCode >= 500) {
    const logContext = {
      method: req.method,
      url: req.originalUrl,
      user: req.user?._id,
      params: req.params,
      body: req.body
    };
    
    logger.error(`${err.statusCode} ${err.message}`, {
      error: err,
      context: logContext
    });
  }
  
  // 3. Handle specific error types
  let handledError = { ...err, message: err.message };
  
  // 3.1 JWT Errors
  if (err.name === 'JsonWebTokenError') {
    handledError = new APIError('Invalid token. Please log in again', 401);
  } else if (err.name === 'TokenExpiredError') {
    handledError = new APIError('Token expired. Please log in again', 401);
  }
  
  // 3.2 MongoDB Errors
  else if (err.name === 'CastError') {
    handledError = new APIError(`Invalid ${err.path}: ${err.value}`, 400);
  } else if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    handledError = new APIError(`Validation failed: ${errors.join('. ')}`, 400);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    handledError = new APIError(`${field} already exists`, 409);
  }
  
  // 3.3 Mongoose DocumentNotFoundError (v5)
  else if (err.name === 'DocumentNotFoundError') {
    handledError = new APIError('Requested resource not found', 404);
  }
  
  // 3.4 Rate limiter errors
  else if (err.name === 'RateLimitError') {
    handledError = new APIError('Too many requests, please try again later', 429);
  }
  
  // 4. Security: Mask internal errors in production
  if (handledError.statusCode >= 500 && process.env.NODE_ENV === 'production') {
    handledError.message = 'Internal server error';
  }
  
  // 5. Send error response
  res.status(handledError.statusCode).json({
    status: handledError.status,
    message: handledError.message,
    // Stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { 
      stack: handledError.stack,
      originalError: {
        message: err.message,
        stack: err.stack
      }
    }),
    // Validation errors
    ...(handledError.errors && { errors: handledError.errors }),
    // Rate limit info
    ...(handledError.rateLimit && { 
      rateLimit: {
        limit: handledError.rateLimit.limit,
        current: handledError.rateLimit.current,
        remaining: handledError.rateLimit.remaining,
        resetTime: handledError.rateLimit.resetTime
      }
    })
  });
};

module.exports = {
  notFoundHandler,
  catchAsync,
  errorHandler
};