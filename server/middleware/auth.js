import jwt from 'jsonwebtoken';
import APIError from '../utils/APIError.js';
import config from '../config/env.js';
import User from '../models/User.js';

/**
 * Protect routes with JWT authentication
 */
const authenticate = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new APIError(401, 'You are not logged in! Please log in to get access');
    }

    // 2) Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new APIError(401, 'The user belonging to this token no longer exists');
    }

    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new APIError(401, 'User recently changed password! Please log in again');
    }

    // 5) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict route to specific roles
 * @param {...String} roles - Allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new APIError(403, 'You do not have permission to perform this action');
    }
    next();
  };
};

/**
 * Check if user is authenticated (optional)
 */
const optionalAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      const currentUser = await User.findById(decoded.id);
      
      if (currentUser && !currentUser.changedPasswordAfter(decoded.iat)) {
        req.user = currentUser;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export { authenticate, restrictTo, optionalAuth };