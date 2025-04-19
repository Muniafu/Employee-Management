import Joi from 'joi';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from './constants.js';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(5000),
  MONGODB_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  SMTP_HOST: Joi.string().hostname(),
  SMTP_PORT: Joi.number().port(),
  SMTP_USER: Joi.string(),
  SMTP_PASS: Joi.string()
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  logger.error('❌ Environment validation error:', error.message);
  process.exit(HTTP_STATUS.SERVER_ERROR);
}

export const env = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoUri: envVars.MONGODB_URI,
  jwtSecret: envVars.JWT_SECRET,
  frontendUrl: envVars.FRONTEND_URL,
  smtp: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS
  },
  isProduction: envVars.NODE_ENV === 'production',
  isTest: envVars.NODE_ENV === 'test'
};