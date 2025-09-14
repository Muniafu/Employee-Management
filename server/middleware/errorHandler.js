// Not Found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized Error Handler
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(400).json({
      message: `Duplicate field: ${Object.keys(err.keyValue).join(', ')} must be unique`
    });
  }

  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    message: err.message || 'server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };