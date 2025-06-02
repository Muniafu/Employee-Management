const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');
const logger = require('../utils/logger');
const APIError = require('../utils/APIError'); // Assume custom error class

// Token expiration times
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const EMAIL_VERIFICATION_EXPIRES = '1d';

class AuthService {
  /**
   * Register new user with optional employee association
   * @param {Object} userData - { email, password, role }
   * @param {Object} [employeeData] - Employee profile data
   * @returns {Promise<Object>} { user, tokens, employee? }
   */
  static async register(userData, employeeData = null) {
    try {
      // Check for existing user
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new APIError('Email already in use', 409);
      }

      let employee = null;
      
      // Create employee profile if data provided
      if (employeeData) {
        employee = await Employee.create(employeeData);
      }

      // Create user with optional employee reference
      const user = await User.create({
        ...userData,
        ...(employee && { employee: employee._id })
      });

      // Generate tokens
      const tokens = this.generateTokens(user);
      
      logger.info(`New user registered: ${user.email}`);
      return { user, tokens, ...(employee && { employee }) };
    } catch (error) {
      logger.error(`Registration failed: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Authenticate user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} { user, tokens }
   */
  static async login(email, password) {
    try {
      const user = await User.findOne({ email }).select('+password');
      
      if (!user || !(await user.comparePassword(password))) {
        throw new APIError('Invalid email or password', 401);
      }

      if (!user.isActive) {
        throw new APIError('Account is disabled', 403);
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      const tokens = this.generateTokens(user);
      logger.info(`User logged in: ${user.email}`);
      return { user, tokens };
    } catch (error) {
      logger.error(`Login failed for ${email}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken 
   * @returns {Promise<Object>} New tokens
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET
      );
      
      const user = await User.findById(decoded.id);
      if (!user) throw new APIError('User not found', 404);

      return this.generateTokens(user);
    } catch (error) {
      logger.error(`Token refresh failed: ${error.message}`);
      throw new APIError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Initiate password reset
   * @param {string} email 
   * @returns {Promise<string>} Reset token
   */
  static async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) throw new APIError('User not found', 404);

      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      logger.info(`Password reset initiated for ${email}`);
      return resetToken;
    } catch (error) {
      logger.error(`Password reset failed for ${email}: ${error.message}`);
      throw new APIError('Password reset failed', 500);
    }
  }

  /**
   * Reset password
   * @param {string} token 
   * @param {string} newPassword 
   * @returns {Promise<User>} Updated user
   */
  static async resetPassword(token, newPassword) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) throw new APIError('Token is invalid or expired', 400);

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = Date.now();
      await user.save();

      logger.info(`Password reset for user: ${user.email}`);
      return user;
    } catch (error) {
      logger.error(`Password reset failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify email using token
   * @param {string} token 
   * @returns {Promise<User>} Verified user
   */
  static async verifyEmail(token) {
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_VERIFICATION_SECRET
      );
      
      const user = await User.findById(decoded.id);
      if (!user) throw new APIError('User not found', 404);
      if (user.isEmailVerified) throw new APIError('Email already verified', 400);

      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });

      return user;
    } catch (error) {
      logger.error(`Email verification failed: ${error.message}`);
      throw new APIError('Invalid or expired verification token', 401);
    }
  }

  /**
   * Generate JWT tokens
   * @param {User} user 
   * @returns {Object} { accessToken, refreshToken }
   */
  static generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Generate email verification token
   * @param {User} user 
   * @returns {string} Verification token
   */
  static generateEmailVerificationToken(user) {
    return jwt.sign(
      { id: user._id },
      process.env.JWT_VERIFICATION_SECRET,
      { expiresIn: EMAIL_VERIFICATION_EXPIRES }
    );
  }

  /**
   * Change user password
   * @param {string} userId 
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise<User>} Updated user
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) throw new APIError('User not found', 404);
      
      if (!(await user.comparePassword(currentPassword))) {
        throw new APIError('Current password is incorrect', 401);
      }

      user.password = newPassword;
      user.passwordChangedAt = Date.now();
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);
      return user;
    } catch (error) {
      logger.error(`Password change failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AuthService;