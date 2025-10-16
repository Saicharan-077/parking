// Import JSON Web Token library for token verification
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens on incoming requests
const authenticateToken = (req, res, next) => {
  // Extract Authorization header from request
  const authHeader = req.headers['authorization'];
  // Extract token from "Bearer <token>" format
  const token = authHeader && authHeader.split(' ')[1];

  // Return 401 if no token is provided
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify the JWT token using secret key
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    // Return 403 if token is invalid or expired
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // Attach decoded user information to request object
    req.user = user;
    // Proceed to next middleware/route handler
    next();
  });
};

// Middleware to authorize admin-only access
const authorizeAdmin = (req, res, next) => {
  // Check if authenticated user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  // Proceed if user is admin
  next();
};

// Export middleware functions for use in routes
module.exports = { authenticateToken, authorizeAdmin };
