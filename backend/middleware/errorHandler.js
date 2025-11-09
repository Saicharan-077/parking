class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  // Log securely to file only
  req.logger?.error('Security Event', {
    errorId: Date.now().toString(36),
    status: err.statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  // Generic secure messages
  const secureMessages = {
    400: 'Invalid request',
    401: 'Authentication required', 
    403: 'Access denied',
    404: 'Resource not found',
    429: 'Too many requests',
    500: 'Internal server error'
  };
  
  res.status(err.statusCode).json({
    error: secureMessages[err.statusCode] || 'An error occurred'
  });
};

// Disable console output in production
if (process.env.NODE_ENV === 'production') {
  console.error = () => {};
  console.warn = () => {};
}

module.exports = { AppError, catchAsync, globalErrorHandler };