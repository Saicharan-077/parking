// Import JSON Web Token library for token verification
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens on incoming requests
const authenticateToken = (req, res, next) => {
  // Extract Authorization header from request
  const authHeader = req.headers['authorization'];
  
  // Validate Authorization header format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1];

  // Return 401 if no token is provided
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Ensure JWT_SECRET is set
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Verify the JWT token using secret key with additional options
  jwt.verify(token, jwtSecret, {
    algorithms: ['HS256'], // Only allow HMAC SHA256
    maxAge: '7d' // Maximum token age
  }, (err, user) => {
    // Return 403 if token is invalid or expired
    if (err) {
      let errorMessage = 'Invalid or expired token';
      if (err.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
      } else if (err.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token format';
      }
      return res.status(403).json({ error: errorMessage });
    }
    
    // Validate user object structure
    if (!user || !user.id || !user.email || !user.role) {
      return res.status(403).json({ error: 'Invalid token payload' });
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
