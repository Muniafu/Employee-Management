import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';

/**
 * Convert error to APIError if needed
 */
const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof APIError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;
    const message = error.message || 'Internal Server Error';
    error = new APIError(statusCode, message, false, err.stack);
  }

  next(error);
};

/**
 * Handle all errors
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  res.status(statusCode).json(response);
};

/**
 * Catch 404 and forward to error handler
 */
const notFound = (req, res, next) => {
  next(new APIError(404, 'Resource not found'));
};

export { errorConverter, errorHandler, notFound };