/**
 * Unified API Response Handler
 * Combines best practices from both implementations with enhanced features
 */
class ResponseHandler {
  /**
   * Send a standardized success response
   * @param {Object} res - Express response object
   * @param {Object} options - Response configuration
   * @param {any} [options.data] - Response payload
   * @param {string} [options.message='Success'] - Human-readable message
   * @param {number} [options.statusCode=200] - HTTP status code
   * @param {Object} [options.meta={}] - Additional metadata
   * @param {Object} [options.pagination] - Pagination information
   */
  static success({
    res,
    data = null,
    message = 'Success',
    statusCode = 200,
    meta = {},
    pagination = null
  }) {
    const response = {
      status: 'success',
      message,
      data,
      ...(Object.keys(meta).length > 0 && { meta }),
      ...(pagination && { pagination })
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a standardized error response
   * @param {Object} res - Express response object
   * @param {Object} options - Error configuration
   * @param {string} options.message - Error message
   * @param {number} [options.statusCode=500] - HTTP status code
   * @param {any} [options.error=null] - Original error object
   * @param {Object} [options.errors=null] - Validation errors
   * @param {boolean} [options.logError=true] - Whether to log the error
   */
  static error({
    res,
    message = 'An error occurred',
    statusCode = 500,
    error = null,
    errors = null,
    logError = true
  }) {
    // Log server errors in development/production
    if (logError && statusCode >= 500) {
      const logger = require('./logger');
      logger.error(`[${statusCode}] ${message}`, { error });
    }

    const response = {
      status: 'error',
      message,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' && error && { error })
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a validation error response (422 Unprocessable Entity)
   * @param {Object} res - Express response object
   * @param {Object} errors - Validation errors object
   * @param {string} [message='Validation failed'] - Custom message
   */
  static validationError(res, errors, message = 'Validation failed') {
    return this.error({
      res,
      message,
      errors,
      statusCode: 422,
      logError: false
    });
  }

  /**
   * Send a not found response (404 Not Found)
   * @param {Object} res - Express response object
   * @param {string} [resource='Resource'] - Name of missing resource
   */
  static notFound(res, resource = 'Resource') {
    return this.error({
      res,
      message: `${resource} not found`,
      statusCode: 404,
      logError: false
    });
  }

  /**
   * Send an authentication error response (401 Unauthorized)
   * @param {Object} res - Express response object
   * @param {string} [message='Unauthorized'] - Custom message
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error({
      res,
      message,
      statusCode: 401,
      logError: false
    });
  }

  /**
   * Send a forbidden response (403 Forbidden)
   * @param {Object} res - Express response object
   * @param {string} [message='Forbidden'] - Custom message
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error({
      res,
      message,
      statusCode: 403,
      logError: false
    });
  }

  /**
   * Send a conflict response (409 Conflict)
   * @param {Object} res - Express response object
   * @param {string} [message='Resource conflict'] - Custom message
   */
  static conflict(res, message = 'Resource conflict') {
    return this.error({
      res,
      message,
      statusCode: 409,
      logError: false
    });
  }
}

module.exports = ResponseHandler;