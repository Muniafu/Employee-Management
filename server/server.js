const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const logger = require('./config/logger');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Basic middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (morgan -> winston)
app.use(
  morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', {
    stream: logger.stream,
  })
);

// Routes (ensure these files exist under backend/routes/)
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Mount API routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payrolls', payrollRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check / root
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'EMS Backend', env: process.env.NODE_ENV || 'development' });
});

// Error handling middleware (404 + centralized error handler)
app.use(notFound);
app.use(errorHandler);

// Start server after DB connected
const PORT = parseInt(process.env.PORT, 10) || 5000;

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} (pid: ${process.pid})`);
      console.log(`> Backend listening on http://localhost:${PORT}`);
    });

    // Graceful shutdown handlers
    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Closing server...`);
      server.close(async () => {
        try {
          // close mongoose connection if open
          const mongoose = require('mongoose');
          if (mongoose.connection && mongoose.connection.readyState === 1) {
            await mongoose.connection.close(false);
            logger.info('MongoDB connection closed');
          }
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Uncaught exceptions / rejections
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception', err);
      // give logger a moment then exit
      setTimeout(() => process.exit(1), 100);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', reason);
      // optionally exit or keep running depending on policy
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

module.exports = app;
