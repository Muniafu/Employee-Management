const jwt = require('jsonwebtoken');
const User = require('../models/User');
const APIError = require('../utils/APIError');
const logger = require('../utils/logger');

/**
 * @desc    Protect routes with JWT authentication
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Next middleware function
 */
const protect = async (req, res, next) => {
  try {
    // 1. Get token from multiple sources
    let token;
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;
    
    // Check Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // Fallback to cookie
    else if (cookieToken) {
      token = cookieToken;
    }
    
    // 2. Reject if no token found
    if (!token) {
      throw new APIError('Not authorized to access this route', 401);
    }
    
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // 4. Check if user still exists and is active
    const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!currentUser || !currentUser.isActive) {
      throw new APIError('User belonging to this token no longer exists', 401);
    }
    
    // 5. Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new APIError('Password changed recently. Please log in again', 401);
    }
    
    // 6. Attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error(`Authentication failed: ${error.message}`);
    next(new APIError('Not authorized to access this route', 401));
  }
};

/**
 * @desc    Role-Based Access Control (RBAC) middleware
 * @param   {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      // 1. Check if user has required role
      if (!roles.includes(req.user.role)) {
        logger.warn(
          `User ${req.user._id} (${req.user.role}) attempted to access ${req.method} ${req.originalUrl}`
        );
        throw new APIError('Not authorized to perform this action', 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * @desc    Inject model instance into request
 * @param   {mongoose.Model} model - Mongoose model
 * @param   {string} [paramName='id'] - Route parameter name
 * @param   {string} [propertyName='doc'] - Property name to attach to request
 * @returns {Function} Middleware function
 */
const injectModel = (model, paramName = 'id', propertyName = 'doc') => {
  return async (req, res, next) => {
    try {
      // 1. Get ID from request parameters
      const id = req.params[paramName];
      
      // 2. Find document by ID
      const doc = await model.findById(id);
      if (!doc) {
        throw new APIError(`${model.modelName} not found`, 404);
      }
      
      // 3. Attach document to request
      req[propertyName] = doc;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * @desc    Check resource ownership
 * @param   {string} [ownerPath='employee'] - Path to owner reference in document
 * @param   {string} [userPath='employee'] - Path to user's reference in request
 * @returns {Function} Middleware function
 */
const checkOwnership = (ownerPath = 'employee', userPath = 'employee') => {
  return (req, res, next) => {
    try {
      // 1. Admins bypass ownership checks
      if (req.user.role === 'admin') return next();
      
      // 2. Get owner reference from document
      const ownerRef = ownerPath.split('.').reduce(
        (obj, key) => (obj && obj[key] ? obj[key] : null), 
        req.doc
      );
      
      // 3. Get user's reference from request
      const userRef = userPath.split('.').reduce(
        (obj, key) => (obj && obj[key] ? obj[key] : null), 
        req.user
      );
      
      // 4. Compare references
      if (!ownerRef || !ownerRef.equals(userRef)) {
        logger.warn(
          `User ${req.user._id} attempted to access ${req.doc.constructor.modelName} ${req.doc._id} without ownership`
        );
        throw new APIError('Not authorized to access this resource', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * @desc    Verify refresh token middleware
 * @returns {Function} Middleware function
 */
const verifyRefreshToken = () => {
  return async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        throw new APIError('No refresh token provided', 401);
      }
      
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new APIError('User not found', 404);
      }
      
      req.user = user;
      next();
    } catch (error) {
      logger.error(`Refresh token verification failed: ${error.message}`);
      next(new APIError('Invalid or expired refresh token', 401));
    }
  };
};

module.exports = {
  protect,
  authorize,
  injectModel,
  checkOwnership,
  verifyRefreshToken
};