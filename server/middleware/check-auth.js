const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');

module.exports = (req, res, next) => {
  // Skip authentication for OPTIONS requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(401, 'Authorization header missing or invalid');
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw createHttpError(401, 'Authentication token missing');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (err) {
    // Handle different error scenarios
    if (err.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(createHttpError(401, 'Invalid token'));
    }
    next(err);
  }
};