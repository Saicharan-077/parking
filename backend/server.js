// Import required modules
const express = require('express'); // Web framework for Node.js
const cors = require('cors'); // Middleware for enabling CORS
const helmet = require('helmet'); // Security middleware
const rateLimit = require('express-rate-limit'); // Rate limiting middleware
const winston = require('winston'); // Logging library
const multer = require('multer'); // File upload middleware
const path = require('path'); // Node.js path module
require('dotenv').config(); // Load environment variables from .env file

// Import database
const db = require('./database'); // Database connection
const { optimizeDatabase } = require('./database-optimize');

// Import route modules
const vehicleRoutes = require('./routes/vehicles'); // Routes for vehicle operations
const authRoutes = require('./routes/auth'); // Routes for authentication
const exportRoutes = require('./routes/exports'); // Routes for data exports

// Import security middleware
const { securityHeaders, corsConfig } = require('./middleware/security');
const { sanitizeInputs } = require('./middleware/sanitization');
const { csrfProtection, getCSRFToken } = require('./middleware/csrf');
const { apiVersioning } = require('./middleware/versioning');
const { globalErrorHandler, AppError } = require('./middleware/errorHandler');
const { performanceMonitor } = require('./middleware/performance');
const { securityResponseHeaders } = require('./middleware/security-headers');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

// Create Express application instance
const app = express();
const PORT = process.env.PORT || 6228; // Set port from environment or default to 6228



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

// Auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // Higher limit for development
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});



// Middleware setup
app.use(securityResponseHeaders);
app.use(performanceMonitor);
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3228', 'http://127.0.0.1:3228', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(limiter);
app.use(mongoSanitize());
app.use(sanitizeInputs);
app.use(apiVersioning);
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded request bodies with size limit

// Make logger available in routes
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// API routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/exports', exportRoutes);
app.get('/api/v1/csrf-token', getCSRFToken);

// Legacy routes (redirect to v1)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/exports', exportRoutes);

// API Documentation
app.get('/api/v1/docs', (req, res) => {
  res.json({
    title: 'VNR Parking API Documentation',
    version: '1.0.0',
    description: 'Smart parking management system for VNR VJIET',
    endpoints: {
      auth: {
        'POST /api/v1/auth/login': 'User login',
        'POST /api/v1/auth/register': 'User registration',
        'POST /api/v1/auth/forgot-password': 'Password reset request',
        'GET /api/v1/auth/profile': 'Get user profile'
      },
      vehicles: {
        'GET /api/v1/vehicles': 'List vehicles (auth required)',
        'POST /api/v1/vehicles': 'Register vehicle (auth required)',
        'GET /api/v1/vehicles/stats': 'Vehicle statistics (public)',
        'GET /api/v1/vehicles/:id': 'Get vehicle details (auth required)'
      },
      system: {
        'GET /api/v1/health': 'System health check',
        'GET /api/v1/docs': 'API documentation'
      }
    },
    authentication: 'Bearer JWT token in Authorization header',
    rateLimit: '100 requests per 15 minutes (general), 50 requests per 15 minutes (auth)'
  });
});

// Comprehensive health check
app.get('/api/v1/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'disconnected',
    services: {
      auth: 'OK',
      vehicles: 'OK',
      exports: 'OK'
    }
  };
  
  // Test database
  try {
    await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    health.database = 'connected';
  } catch (err) {
    health.status = 'ERROR';
    health.database = 'disconnected';
    // Log error securely, don't expose details
    req.logger?.error('Database connection failed', { error: err.message });
  }
  
  const statusCode = health.status === 'OK' ? 200 : 500;
  res.status(statusCode).json(health);
});

// Error handling
app.use(globalErrorHandler);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 VNR Parking API server is running on port ${PORT}`);
  
  // Test database connection and optimize
  db.get('SELECT 1', (err) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
    } else {
      console.log('✅ Database connected successfully');
      // Optimize database on startup
      setTimeout(() => optimizeDatabase(), 1000);
    }
  });
});

// Secure process error handlers
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { error: err.message });
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message });
  process.exit(1);
});

// Disable sensitive console output in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
}
