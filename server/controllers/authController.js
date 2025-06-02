const authService = require('../services/authService');
const notificationService = require('../services/notificationService');
const { ResponseHandler } = require('../utils/response');
const logger = require('../utils/logger');
const APIError = require('../utils/APIError');

class AuthController {
  /**
   * @desc    Register new user with optional employee profile
   * @route   POST /api/v1/auth/register
   * @access  Public
   */
  static async register(req, res) {
    try {
      const { user: userData, employee: employeeData } = req.body;
      
      const { user, employee, tokens } = await authService.register(
        userData, 
        employeeData
      );

      // Generate email verification token
      const verifyToken = AuthService.generateEmailVerificationToken(user);
      
      // Send welcome email (non-blocking)
      notificationService.sendAccountActivation(user.email, verifyToken)
        .catch(err => logger.error(`Welcome email failed: ${err.message}`));

      ResponseHandler.success({
        res,
        statusCode: 201,
        message: 'Registration successful',
        data: { 
          user, 
          ...(employee && { employee }),
          accessToken: tokens.accessToken 
        }
      });
    } catch (error) {
      logger.error(`Registration failed: ${error.message}`, { error });
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error : null
      });
    }
  }

  /**
   * @desc    Authenticate user
   * @route   POST /api/v1/auth/login
   * @access  Public
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const { user, tokens } = await authService.login(email, password);
      
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      ResponseHandler.success({
        res,
        message: 'Login successful',
        data: { 
          user, 
          accessToken: tokens.accessToken 
        }
      });
    } catch (error) {
      logger.error(`Login failed for ${email}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: 401,
        message: 'Invalid credentials',
        error: null // Don't leak details
      });
    }
  }

  /**
   * @desc    Refresh access token
   * @route   POST /api/v1/auth/refresh-token
   * @access  Public
   */
  static async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        throw new APIError('No refresh token provided', 401);
      }

      const tokens = await authService.refreshToken(refreshToken);
      
      // Optionally renew the refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      ResponseHandler.success({
        res,
        message: 'Token refreshed',
        data: { accessToken: tokens.accessToken }
      });
    } catch (error) {
      logger.error(`Token refresh failed: ${error.message}`);
      ResponseHandler.unauthorized(res, 'Invalid refresh token');
    }
  }

  /**
   * @desc    Logout user
   * @route   POST /api/v1/auth/logout
   * @access  Private
   */
  static logout(req, res) {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      expires: new Date(0) // Immediately expire
    });
    
    ResponseHandler.success({
      res,
      message: 'Logout successful'
    });
  }

  /**
   * @desc    Forgot password - initiate reset
   * @route   POST /api/v1/auth/forgot-password
   * @access  Public
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const resetToken = await authService.forgotPassword(email);
      
      // Send password reset email
      await notificationService.sendPasswordResetEmail(email, resetToken);

      ResponseHandler.success({
        res,
        message: 'Password reset instructions sent to email'
      });
    } catch (error) {
      // Don't reveal if email doesn't exist
      logger.error(`Password reset failed for ${email}: ${error.message}`);
      ResponseHandler.success({
        res,
        message: 'If the email exists, reset instructions will be sent'
      });
    }
  }

  /**
   * @desc    Reset password
   * @route   PATCH /api/v1/auth/reset-password/:token
   * @access  Public
   */
  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      const user = await authService.resetPassword(token, password);
      
      // Notify user of password change
      notificationService.sendEmail({
        to: user.email,
        subject: 'Password Changed',
        text: 'Your password has been successfully changed.'
      }).catch(err => logger.error('Password change notification failed', err));

      ResponseHandler.success({
        res,
        message: 'Password reset successful'
      });
    } catch (error) {
      logger.error(`Password reset failed: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: 400,
        message: 'Invalid or expired token'
      });
    }
  }

  /**
   * @desc    Verify email
   * @route   GET /api/v1/auth/verify-email/:token
   * @access  Public
   */
  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const user = await authService.verifyEmail(token);
      
      ResponseHandler.success({
        res,
        message: 'Email verified successfully',
        data: { user }
      });
    } catch (error) {
      logger.error(`Email verification failed: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: 400,
        message: 'Invalid or expired verification token'
      });
    }
  }

  /**
   * @desc    Change password
   * @route   PATCH /api/v1/auth/change-password
   * @access  Private
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; // From authentication middleware
      
      const user = await authService.changePassword(
        userId, 
        currentPassword, 
        newPassword
      );

      // Notify user of password change
      notificationService.sendEmail({
        to: user.email,
        subject: 'Password Changed',
        text: 'Your password has been successfully changed.'
      }).catch(err => logger.error('Password change notification failed', err));

      ResponseHandler.success({
        res,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error(`Password change failed: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: 401,
        message: 'Current password is incorrect'
      });
    }
  }
}

module.exports = AuthController;