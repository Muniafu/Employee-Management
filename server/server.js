// Core Modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Config and Utils
import { env } from './config/env.js';
import { db } from './config/db.js';
import { logger } from './utils/logger.js';
import { HTTP_STATUS } from './config/constants.js';

// Middleware
import { globalErrorHandler, notFound } from './middleware/errorHandler.js';
import { authenticate, refreshToken } from './middleware/authMiddleware.js';
import { restrictTo } from './middleware/roleMiddleware.js';
import { validate, AuthSchemas } from './middleware/validateRequest.js';

// Routes
import authRouter from './routes/authRoutes.js';
import performanceRouter from './routes/employeeRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import adminController from './controllers/adminController.js';
import authController from './controllers/authController.js';

// Initialize App
const app = express();

// Connect to DB
db.connect();

// Global Middleware
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(HTTP_STATUS.SUCCESS).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Public Routes
app.post('/api/v1/auth/login', validate(AuthSchemas.login), authController.login);

// Protected Admin Routes
app.post(
  '/api/v1/admin/employees',
  authenticate,
  restrictTo('admin'),
  validate(AuthSchemas.register),
  adminController.createEmployee
);

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/performance', performanceRouter);
app.use('/api/v1/admin', adminRouter);

// 404 for unmatched routes
app.all('*', (req, res, next) => {
  next(new Error(`Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handlers
app.use(notFound);
app.use(globalErrorHandler);

// Start Server
const server = app.listen(env.port, () => {
  logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await db.disconnect();
    logger.info('Server terminated');
    process.exit(0);
  });
});