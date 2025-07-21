const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');

module.exports = (req, res, next) => {

  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(401, 'Authorization header missing or invalid');
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user data to request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (err) {
    handleAuthError(err, next);
  }
};

// Role checking middleware
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!Array.isArray(requiredRoles)) {
        requiredRoles = [requiredRoles];
      }

      if (!requiredRoles.includes(req.user.role)) {
        throw createHttpError(403, 'Access denied: insufficient permissions');
      }

      next();
    } catch (err) {
      handleAuthError(err, next);
    }
  };
};

// Error handling function
const handleAuthError = (err, next) => {
  if (err.name === 'TokenExpiredError') {
    return next(createHttpError(401, 'Invalid token'));
  }
  if (err.name === 'JsonWebTokenError') {
    return next(createHttpError(401, 'Token expired'));
  }
  next(err);
};

module.exports = {
  checkAuth,
  checkRole
};