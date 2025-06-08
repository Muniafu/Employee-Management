const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const AppError = require('../utils/appError');

// Protect routes - verify JWT and check if user exists
const protect = async (req, res, next) => {
  try {
    // 1) Get token from headers, cookies, or query string
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists (admin or employee)
    let currentUser;
    if (decoded.role === 'admin' || decoded.role === 'super-admin') {
      currentUser = await Admin.findById(decoded.id).select('+role');
    } else {
      currentUser = await Employee.findById(decoded.id)
        .select('+role +status')
        .populate('manager');
      
      // Check if employee is approved
      if (currentUser?.status !== 'approved') {
        return next(
          new AppError('Your account is not yet approved or has been deactivated.', 401)
        );
      }
    }

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

    // 5) Grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser; // For templates if using SSR
    next();
  } catch (err) {
    next(err);
  }
};

// Role-based access control
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Only for authenticated users (no role check)
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please authenticate to access this resource', 401));
  }
  next();
};

module.exports = {
  protect,
  restrictTo,
  isAuthenticated
};