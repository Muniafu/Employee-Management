import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const connectWithRetry = async (retryCount = 0) => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    logger.info('✅ MongoDB connected successfully');
  } catch (err) {
    logger.error(`❌ MongoDB connection failed (attempt ${retryCount + 1}):`, err.message);
    
    if (retryCount < MAX_RETRIES - 1) {
      logger.info(`Retrying connection in ${RETRY_DELAY_MS/1000} seconds...`);
      setTimeout(() => connectWithRetry(retryCount + 1), RETRY_DELAY_MS);
    } else {
      logger.error('Failed to connect to MongoDB after maximum retries');
      process.exit(1);
    }
  }
};

const disconnect = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

// Connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected');
});

process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

export const db = {
  connect: connectWithRetry,
  disconnect,
  connection: mongoose.connection
};