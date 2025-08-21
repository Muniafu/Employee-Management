const mongoose = require('mongoose');
const logger = require('./logger'); // require logger to log DB events
const dotenv = require('dotenv');


dotenv.config();


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ems_db';


/**
* Connects to MongoDB using mongoose.
* - Uses recommended options, reconnectTries handled by mongoose internally in recent versions.
* - Logs connection events.
*/
async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        logger.info('MongoDB already connected');
        return mongoose.connection;
    }
    try {
        // Recommended options are minimal; mongoose manages most reconnect logic internally.
        await mongoose.connect(MONGO_URI);
        
        logger.info(`MongoDB connected to ${MONGO_URI}`);

        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });
        
        // Gracefully handle app termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info('MongoDB connection closed due to app termination');
                process.exit(0);
            } catch (err) {
                logger.error('Error closing MongoDB connection on app termination', err);
                process.exit(1);
            }
        });
        
        return mongoose.connection;
    } catch (err) {
        logger.error('Failed to connect to MongoDB', err);
        throw err;
    }
}


module.exports = { connectDB };