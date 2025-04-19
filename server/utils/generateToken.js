import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { SECURITY } from '../config/constants.js';
import { generateTokenPair } from '../utils/generateToken.js';

const { accessToken, refreshToken } = generateTokenPair(userId, userRole);

/**
 * Generate JWT tokens with different types and expiration
 * @param {string|object} payload - User ID or payload object
 * @param {string} type - Token type ('access', 'refresh', 'reset')
 * @returns {string} Generated token
 */
export const generateToken = (payload, type = 'access') => {
  const options = {
    issuer: 'performance-system-api',
    audience: env.isProduction ? env.frontendUrl : 'localhost'
  };

  switch (type) {
    case 'access':
      return jwt.sign(
        typeof payload === 'string' ? { id: payload } : payload,
        env.jwtSecret,
        { ...options, expiresIn: SECURITY.JWT_EXPIRY }
      );

    case 'refresh':
      return jwt.sign(
        { id: typeof payload === 'string' ? payload : payload.id },
        env.jwtRefreshSecret,
        { ...options, expiresIn: '30d' }
      );

    case 'reset':
      return jwt.sign(
        { id: typeof payload === 'string' ? payload : payload.id },
        env.jwtResetSecret,
        { ...options, expiresIn: '1h' }
      );

    default:
      throw new Error('Invalid token type specified');
  }
};

/**
 * Verify JWT token with type-specific secret
 * @param {string} token 
 * @param {string} type 
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token, type = 'access') => {
  const secret = {
    access: env.jwtSecret,
    refresh: env.jwtRefreshSecret,
    reset: env.jwtResetSecret
  }[type];

  if (!secret) throw new Error('Invalid token type');

  return jwt.verify(token, secret, {
    issuer: 'performance-system-api',
    audience: env.isProduction ? env.frontendUrl : 'localhost'
  });
};

/**
 * Generate token pair (access + refresh)
 * @param {string} userId 
 * @param {string} role 
 * @returns {object} { accessToken, refreshToken }
 */
export const generateTokenPair = (userId, role) => ({
  accessToken: generateToken({ id: userId, role }),
  refreshToken: generateToken(userId, 'refresh')
});