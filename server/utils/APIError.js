/**
 * Custom API Error Class
 * @extends Error
 */
class APIError extends Error {
  /**
   * Create a custom API error
   * @param {string} message - Error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {Object} [errors] - Additional error details
   * @param {string} [stack] - Error stack trace
   */
  constructor(message, statusCode = 500, errors = null, stack = '') {
    super(message);
    
    // Set error properties
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Mark as operational error
    this.errors = errors || undefined;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace (excluding constructor call)
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Create a standardized error object for responses
   * @returns {Object} - Error response object
   */
  toResponse() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
  
  /**
   * Create a Not Found error
   * @param {string} resource - Resource name
   * @returns {APIError}
   */
  static notFound(resource) {
    return new APIError(`${resource} not found`, 404);
  }
  
  /**
   * Create an Unauthorized error
   * @param {string} [message='Unauthorized'] - Custom message
   * @returns {APIError}
   */
  static unauthorized(message = 'Unauthorized') {
    return new APIError(message, 401);
  }
  
  /**
   * Create a Forbidden error
   * @param {string} [message='Forbidden'] - Custom message
   * @returns {APIError}
   */
  static forbidden(message = 'Forbidden') {
    return new APIError(message, 403);
  }
  
  /**
   * Create a Bad Request error
   * @param {string} [message='Bad Request'] - Custom message
   * @param {Object} [errors] - Validation errors
   * @returns {APIError}
   */
  static badRequest(message = 'Bad Request', errors) {
    return new APIError(message, 400, errors);
  }
  
  /**
   * Create a Validation error
   * @param {Object} errors - Validation errors
   * @returns {APIError}
   */
  static validation(errors) {
    return new APIError('Validation failed', 422, errors);
  }
  
  /**
   * Create an Internal Server Error
   * @param {string} [message='Internal Server Error'] - Custom message
   * @returns {APIError}
   */
  static internal(message = 'Internal Server Error') {
    return new APIError(message, 500);
  }
}

export default APIError;