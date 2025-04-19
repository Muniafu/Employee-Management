import { ROLES, HTTP_STATUS } from '../config/constant.js';

// Basic role checker middleware
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: `You don't have permission to perform this action`,
      });
    }
    next();
  };
};

// Hierarchical roles structure
export const hierarchicalRoles = {
  admin: [ROLES.ADMIN],
  management: [ROLES.ADMIN, ROLES.MANAGER],
  allEmployees: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
};

// Permission-based middleware with special manager case
export const checkPermissions = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!hierarchicalRoles[requiredPermission]?.includes(userRole)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: `Requires ${requiredPermission} level permissions`,
      });
    }

    // Manager can only manage their department
    if (userRole === ROLES.MANAGER && req.params.departmentId) {
      if (req.user.department.toString() !== req.params.departmentId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'You can only manage your own department',
        });
      }
    }

    next();
  };
};

// Self or Admin middleware for user-specific actions
export const selfOrAdmin = (field = 'id') => {
  return (req, res, next) => {
    if (
      req.user.role !== ROLES.ADMIN &&
      req.user._id.toString() !== req.params[field]
    ) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: 'You can only modify your own data',
      });
    }
    next();
  };
};