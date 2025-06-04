import express from 'express';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import goalRoutes from './goalsRoutes.js';
import { notFound } from '../middleware/errorHandler.js';

const router = express.Router();

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/employees', employeeRoutes);
router.use('/api/reviews', reviewRoutes);
router.use('/api/goals', goalRoutes);

// 404 handler for API routes
router.use('/api', notFound);

export default router;