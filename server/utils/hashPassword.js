import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';

const hashedPassword = await hashPassword('securePassword123!');
const isMatch = await comparePassword(inputPassword, storedHash);

// Dynamic salt rounds based on environment
const getSaltRounds = () => {
  return env.isProduction ? 12 : 10;
};

/**
 * Hash password with auto-generated salt
 * @param {string} plainPassword 
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (plainPassword) => {
  try {
    const saltRounds = getSaltRounds();
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainPassword, salt);
  } catch (error) {
    logger.error('Password hashing failed:', error);
    throw new Error('Password processing failed');
  }
};

/**
 * Compare plain text password with hashed version
 * @param {string} plainPassword 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>} Match result
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error('Password comparison failed:', error);
    throw new Error('Password verification failed');
  }
};

/**
 * Check if password needs rehashing (for security upgrades)
 * @param {string} hashedPassword 
 * @returns {boolean} Needs rehash
 */
export const needsRehash = (hashedPassword) => {
  const currentRounds = parseInt(hashedPassword.split('$')[2], 10);
  return currentRounds < getSaltRounds();
};

export default { hashPassword, comparePassword, needsRehash
};