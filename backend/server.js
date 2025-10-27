// Import required modules
const express = require('express'); // Web framework for Node.js
const cors = require('cors'); // Middleware for enabling CORS
const helmet = require('helmet'); // Security middleware
const rateLimit = require('express-rate-limit'); // Rate limiting middleware
const winston = require('winston'); // Logging library
const multer = require('multer'); // File upload middleware
const path = require('path'); // Node.js path module
require('dotenv').config(); // Load environment variables from .env file

// Import route modules
const vehicleRoutes = require('./routes/vehicles'); // Routes for vehicle operations
const authRoutes = require('./routes/auth'); // Routes for authentication
const exportRoutes = require('./routes/exports'); // Routes for data exports

// Create Express application instance
const app = express();
const PORT = process.env.PORT || 6202; // Set port from environment or default to 6202

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vnr-parking-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production then log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
})); // Apply security headers
app.use(limiter); // Apply rate limiting
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded request bodies with size limit

// Make logger available in routes
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// Route mounting
app.use('/api/auth', authLimiter, authRoutes); // Mount authentication routes with stricter rate limiting
app.use('/api/vehicles', vehicleRoutes); // Mount vehicle routes at /api/vehicles
app.use('/api/exports', exportRoutes); // Mount export routes at /api/exports

// Health check endpoint to verify server status
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VNR Parking API is running' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log error with Winston
  req.logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }

  // Handle custom errors
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // Default error response
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`🚀 VNR Parking API server is running on port ${PORT}`);
});
