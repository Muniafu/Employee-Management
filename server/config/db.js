const mongoose = require('mongoose');
const logger = require('../utils/logger');
const env = require('./env');

class Database {
  constructor() {
    this.connection = null;
    this._connect();
  }

  _connect() {
    // Connection event handlers
    mongoose.connection.on('connecting', () => {
      logger.info('Connecting to MongoDB...');
    });

    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected: ${mongoose.connection.host}`);
      logger.debug(`Database name: ${mongoose.connection.db.databaseName}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    mongoose.connection.on('error', (error) => {
      logger.error(`MongoDB connection error: ${error.message}`);
      if (env.NODE_ENV === 'production') process.exit(1);
    });

    // Connection parameters
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: env.DB_NAME || 'employee_performance',
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    // Connection with retry logic
    const connectWithRetry = async () => {
      try {
        this.connection = await mongoose.connect(env.MONGO_URI, options);
      } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        
        if (env.NODE_ENV !== 'test') {
          logger.info('Retrying connection in 5 seconds...');
          setTimeout(connectWithRetry, 5000);
        } else {
          process.exit(1);
        }
      }
    };

    connectWithRetry();
  }

  /**
   * Graceful database shutdown
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed');
    } catch (error) {
      logger.error(`Error closing MongoDB connection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Health check for database connection
   * @returns {Promise<Object>} Connection status
   */
  async healthCheck() {
    try {
      if (mongoose.connection.readyState !== 1) {
        return { status: 'down', error: 'Connection not established' };
      }
      
      await mongoose.connection.db.admin().ping();
      return {
        status: 'up',
        database: mongoose.connection.db.databaseName,
        collections: await mongoose.connection.db.listCollections().toArray(),
        stats: await mongoose.connection.db.stats()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error.message
      };
    }
  }
}

// Export singleton database instance
module.exports = new Database();