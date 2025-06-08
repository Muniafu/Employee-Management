const AppError = require('../utils/appError');

// Verify admin privileges
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super-admin')) {
    return next(
      new AppError('This route is restricted to administrators only', 403)
    );
  }
  next();
};

// Verify super-admin privileges
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super-admin') {
    return next(
      new AppError('This route is restricted to super administrators only', 403)
    );
  }
  next();
};

// Check admin or manager privileges
const requireAdminOrManager = (req, res, next) => {
  if (
    !req.user || 
    (
      req.user.role !== 'admin' && 
      req.user.role !== 'super-admin' && 
      req.user.role !== 'manager'
    )
  ) {
    return next(
      new AppError('This route is restricted to administrators or managers only', 403)
    );
  }
  next();
};

module.exports = {
  requireAdmin,
  requireSuperAdmin,
  requireAdminOrManager
};