/**
 * Success response handler
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Optional message
 */
export const successResponse = (res, data = null, statusCode = 200, message = null) => {
  const response = {
    success: true,
    ...(message && { message }),
    ...(data && { data })
  };

  return res.status(statusCode).json(response);
};

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {string|Error} error - Error message or object
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Optional validation errors
 */
export const errorResponse = (res, error, statusCode = 400, errors = null) => {
  let message = typeof error === 'string' ? error : error.message;
  
  // Default message for common status codes
  if (!message) {
    switch (statusCode) {
      case 400: message = 'Bad Request'; break;
      case 401: message = 'Unauthorized'; break;
      case 403: message = 'Forbidden'; break;
      case 404: message = 'Not Found'; break;
      case 500: message = 'Internal Server Error'; break;
      default: message = 'Something went wrong';
    }
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  return res.status(statusCode).json(response);
};

/**
 * Paginated response handler
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Object} meta - Pagination metadata
 * @param {number} statusCode - HTTP status code
 */
export const paginatedResponse = (res, data, meta, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta
  });
};

/**
 * Empty response handler (204 No Content)
 * @param {Object} res - Express response object
 */
export const emptyResponse = (res) => {
  return res.status(204).end();
};