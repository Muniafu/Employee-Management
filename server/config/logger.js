const { createLogger, format, transports } = require('winston');
const path = require('path');


const env = process.env.NODE_ENV || 'development';


const logger = createLogger({
    level: env === 'development' ? 'debug' : 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'ems-backend' },
    transports: [
        new transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join('logs', 'combined.log') }),
    ],
});


// During development, also log to the console with a human-friendly format
if (env === 'development') {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, message, timestamp, stack }) => {
                    return stack
                        ? `${timestamp} ${level}: ${message} - ${stack}`
                        : `${timestamp} ${level}: ${message}`;
                })
            )
        })
    );
}


// Expose a stream for morgan or other logging middleware
logger.stream = {
    write: function (message) {
        // remove trailing newline
        logger.info(message.trim());
    },
};


module.exports = logger;