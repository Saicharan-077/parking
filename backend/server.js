// Import required modules
const express = require('express'); // Web framework for Node.js
const cors = require('cors'); // Middleware for enabling CORS
const helmet = require('helmet'); // Security middleware
const path = require('path'); // Node.js path module
require('dotenv').config(); // Load environment variables from .env file

// Import route modules
const vehicleRoutes = require('./routes/vehicles'); // Routes for vehicle operations
const authRoutes = require('./routes/auth'); // Routes for authentication
const exportRoutes = require('./routes/exports'); // Routes for data exports

// Create Express application instance
const app = express();
const PORT = process.env.PORT || 5001; // Set port from environment or default to 5001

// Middleware setup
app.use(helmet()); // Apply security headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Route mounting
app.use('/api/auth', authRoutes); // Mount authentication routes at /api/auth
app.use('/api/vehicles', vehicleRoutes); // Mount vehicle routes at /api/vehicles
app.use('/api/exports', exportRoutes); // Mount export routes at /api/exports

// Health check endpoint to verify server status
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VNR Parking API is running' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack trace
  res.status(500).json({ error: 'Something went wrong!' }); // Send generic error response
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`🚀 VNR Parking API server is running on port ${PORT}`);
});
