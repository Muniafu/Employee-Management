require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const createHttpError = require('http-errors');

// Database and Routes
const connectDb = require('./database/db');
const superUserRoutes = require('./routes/super-user-routes');
const userRoutes = require('./routes/user-routes');
const leaveRoutes = require('./routes/leaveRoutes');
const checkAuth = require('./middleware/check-auth');

const port = process.env.PORT || 5000;
const app = express();

// ======================
// Security Middlewares
// ======================
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));

// ======================
// Basic Middlewares
// ======================
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// Database Connection
// ======================
connectDb().catch(err => {
  console.error('Database connection failed', err);
  process.exit(1);
});

// ======================
// Routes
// ======================
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.send('Employee Management System API');
});

// API Routes
app.use('/api/superuser', superUserRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', checkAuth, leaveRoutes);

// ======================
// Error Handling
// ======================
// 404 Handler
app.use((req, res, next) => {
  next(createHttpError(404, 'Endpoint not found'));
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

// ======================
// Server Initialization
// ======================
const server = app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});

// ======================
// Graceful Shutdown
// ======================
const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});