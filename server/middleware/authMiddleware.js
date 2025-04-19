import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import Employee from '../models/Employee.js';

export const authenticate = async (req, res, next) => {
  // 1. Extract token from headers or cookies
  try{
    const token = req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.token;

      if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Access denied . No token provided'
        });
      }

      const decode = jwt.verify(token, env.jwtSecret);
      const employee = await Employee.findById(decode.id).select('+passwordChangedAt');

      if (!employee) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'The user belonging to this token no longer exists'
        });
      }

      const passwordChangedAfter = employee.passwordChangedAt
        ? parseInt(employee.passwordChangedAt.getTime() / 1000, 10) > decoded.iat
        : false;

        if (passwordChangedAfter) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: 'User recently changed password. Please log in again'
            });
        }

        req.user = employee;
        next();
    } catch (error) {
        logger.error('Authentication error:', error.message);
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
              success: false,
              error: 'Invalid token. Please log in again'
            });
        }
    }

// Optional: Token refresh middleware
export const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return next();

  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
    const employee = await Employee.findById(decoded.id);

    if (!employee || employee.refreshToken !== refreshToken) {
      return next();
    }

    const newAccessToken = jwt.sign(
      { id: employee._id, role: employee.role },
      env.jwtSecret,
      { expiresIn: '15m' }
    );

    res.locals.newAccessToken = newAccessToken;
    next();
  } catch (error) {
    return next();
  }
}