import mongoose from 'mongoose';
import config from './env.js';
import logger from '../utils/logger.js';

// Remove mongoose warning
mongoose.set('strictQuery', true);

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(1);
});

// Log when MongoDB reconnects
mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected!');
});

// Log when MongoDB is disconnected
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected!');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info(
    'Mongoose default connection disconnected through app termination'
  );
  process.exit(0);
});

/**
 * Connect to MongoDB
 * @returns {Promise<Mongoose>}
 */
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;