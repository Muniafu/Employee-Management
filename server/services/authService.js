import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import config from '../config/env.js';
import APIError from '../utils/APIError.js';

/**
 * Service for user authentication
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user (without password)
   */
  static async register(userData) {
    if (await User.findOne({ email: userData.email })) {
      throw new APIError(400, 'Email already in use');
    }

    const user = await User.create({
      email: userData.email,
      password: userData.password,
      role: userData.role || 'employee'
    });

    return this.sanitizeUser(user);
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User with token
   */
  static async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new APIError(401, 'Incorrect email or password');
    }

    if (!user.isActive) {
      throw new APIError(403, 'Account is deactivated');
    }

    const token = this.generateToken(user);
    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  static generateToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Remove sensitive data from user object
   * @param {Object} user - User object
   * @returns {Object} Sanitized user
   */
  static sanitizeUser(user) {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpires;
    return userObj;
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new APIError(401, 'Current password is incorrect');
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();
  }

  /**
   * Generate password reset token
   * @param {string} email - User email
   * @returns {Promise<string>} Reset token
   */
  static async generatePasswordResetToken(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new APIError(404, 'No user found with this email');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    return resetToken;
  }
}

export default AuthService;