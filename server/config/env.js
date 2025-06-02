const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
const logger = require('../utils/logger');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

// Handle .env loading errors
if (result.error) {
  logger.error('Failed to load .env file:', result.error.message);
  process.exit(1);
}

// Define environment schema with strict validation
const envSchema = Joi.object({
  // Node Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  // Server Configuration
  PORT: Joi.number().default(5000),
  HOST: Joi.string().default('0.0.0.0'),
  
  // MongoDB Configuration
  MONGO_URI: Joi.string().required()
    .description('MongoDB connection string'),
  MONGO_TEST_URI: Joi.string()
    .description('Test MongoDB connection string'),
  DB_NAME: Joi.string().default('employee_performance'),
  
  // JWT Configuration
  JWT_ACCESS_SECRET: Joi.string().required()
    .description('JWT access token secret'),
  JWT_REFRESH_SECRET: Joi.string().required()
    .description('JWT refresh token secret'),
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('7d'),
  
  // Email Configuration
  EMAIL_HOST: Joi.string(),
  EMAIL_PORT: Joi.number(),
  EMAIL_USER: Joi.string(),
  EMAIL_PASSWORD: Joi.string(),
  EMAIL_FROM: Joi.string().email(),
  
  // Frontend URL
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
  
  // Security
  RATE_LIMIT_WINDOW: Joi.number().default(15), // minutes
  RATE_LIMIT_MAX: Joi.number().default(100),
  CORS_ORIGIN: Joi.string().default('*')
})
.unknown(); // Allow additional env vars without validation

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
});

// Handle validation errors
if (error) {
  const errorMessage = `Environment validation error: ${error.details
    .map(detail => detail.message)
    .join('; ')}`;
  logger.error(errorMessage);
  process.exit(1);
}

// Determine appropriate MongoDB URI
const getMongoUri = () => {
  if (envVars.NODE_ENV === 'test') {
    return envVars.MONGO_TEST_URI || 
      envVars.MONGO_URI.replace('DATABASE', 'TEST_DATABASE');
  }
  return envVars.MONGO_URI;
};

// Create configuration object
const config = {
  env: envVars.NODE_ENV,
  server: {
    port: envVars.PORT,
    host: envVars.HOST,
    corsOrigin: envVars.CORS_ORIGIN
  },
  mongoose: {
    uri: getMongoUri(),
    options: {
      dbName: envVars.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: envVars.NODE_ENV !== 'production',
      maxPoolSize: envVars.NODE_ENV === 'production' ? 50 : 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    }
  },
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    accessExpires: envVars.JWT_ACCESS_EXPIRES,
    refreshExpires: envVars.JWT_REFRESH_EXPIRES
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    secure: envVars.EMAIL_PORT === '465',
    auth: envVars.EMAIL_USER ? {
      user: envVars.EMAIL_USER,
      pass: envVars.EMAIL_PASSWORD
    } : null,
    from: envVars.EMAIL_FROM
  },
  frontend: {
    url: envVars.FRONTEND_URL
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW * 60 * 1000, // Minutes to milliseconds
    max: envVars.RATE_LIMIT_MAX
  }
};

// Log successful configuration
logger.info('Environment configuration loaded successfully');
logger.debug(`Environment: ${config.env}`);
logger.debug(`Database: ${config.mongoose.uri}`);
logger.debug(`Server: ${config.server.host}:${config.server.port}`);

module.exports = config;