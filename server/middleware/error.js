/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handling middleware
 * Catches errors and sends standardized error responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle known error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      details: err.message
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      details: 'Your session has expired. Please log in again.'
    });
  }
  
  // Handle database errors
  if (err.code && err.code.startsWith('ER_')) {
    // MySQL error codes start with ER_
    return res.status(500).json({
      error: 'Database error',
      details: process.env.NODE_ENV === 'development' ? err.message : 'A database error occurred.'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details || err.message
    });
  }
  
  // Default error handler
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

/**
 * Catch async errors in Express routes
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync
}; 