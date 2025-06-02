const express = require('express');
const authRoutes = require('./authRoutes');
const employeeRoutes = require('./employeeRoutes');
const goalsRoutes = require('./goalsRoutes');
const reviewRoutes = require('./reviewRoutes');
const { notFoundHandler } = require('../middleware/errorHandler');

const router = express.Router();

// API versioning
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/employees', employeeRoutes);
router.use('/api/v1/goals', goalsRoutes);
router.use('/api/v1/reviews', reviewRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is operational',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Fallback for undefined routes
router.all('*', notFoundHandler);

module.exports = router;