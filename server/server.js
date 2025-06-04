import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/env.js';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { errorConverter, errorHandler } from './middleware/errorHandler.js';
import logger, { morganStream } from './utils/logger.js';

// Initialize Express app
const app = express();

// ========================
// Database Connection
// ========================
connectDB().then(() => {
  logger.info('✅ Database connection established');
}).catch(err => {
  logger.error('❌ Database connection error:', err);
  process.exit(1);
});

// ========================
// Security Middlewares
// ========================

// Enable CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [ // Fields that can be duplicated in query string
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

// ========================
// Development Middlewares
// ========================
if (config.env === 'development') {
  // HTTP request logging
  app.use(morgan(config.logs.morgan, { stream: morganStream }));
  
  // Serve API documentation in development
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use('/api-docs', express.static(path.join(__dirname, '../docs')));
}

// ========================
// Application Routes
// ========================
app.use('/api', routes);

// ========================
// Error Handling
// ========================
app.use(errorConverter); // Convert error to APIError, if needed
app.use(errorHandler); // Handle all errors

// ========================
// Server Initialization
// ========================
const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running in ${config.env} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('💤 Process terminated');
  });
});

export default app;