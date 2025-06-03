import AuthService from '../services/authService.js';
import APIError from '../utils/APIError.js';
import httpStatus from 'http-status';

class AuthController {
  /**
   * Register new user
   */
  static register = async (req, res, next) => {
    try {
      const user = await AuthService.register(req.body);
      res.status(httpStatus.CREATED).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * User login
   */
  static login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      res.status(httpStatus.OK).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password
   */
  static changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request password reset
   */
  static forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      await AuthService.generatePasswordResetToken(email);
      
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Password reset email sent if account exists'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password with token
   */
  static resetPassword = async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;