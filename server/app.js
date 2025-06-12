const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/performance', performanceRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;