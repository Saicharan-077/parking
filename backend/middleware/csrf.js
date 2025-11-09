const crypto = require('crypto');

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map();

// Generate CSRF token
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF protection middleware
function csrfProtection(req, res, next) {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for login and register endpoints (they need special handling)
  if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.headers['authorization']?.split(' ')[1]; // Use JWT token as session identifier

  if (!token || !sessionId) {
    return res.status(403).json({ error: 'CSRF token required' });
  }

  const storedToken = csrfTokens.get(sessionId);
  if (!storedToken || storedToken !== token) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

// Generate and store CSRF token for session
function generateCSRFTokenForSession(sessionId) {
  const token = generateCSRFToken();
  csrfTokens.set(sessionId, token);
  
  // Clean up old tokens (basic cleanup)
  if (csrfTokens.size > 1000) {
    const entries = Array.from(csrfTokens.entries());
    entries.slice(0, 500).forEach(([key]) => csrfTokens.delete(key));
  }
  
  return token;
}

// Get CSRF token endpoint
function getCSRFToken(req, res) {
  const sessionId = req.headers['authorization']?.split(' ')[1];
  if (!sessionId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = generateCSRFTokenForSession(sessionId);
  res.json({ csrfToken: token });
}

module.exports = {
  csrfProtection,
  generateCSRFTokenForSession,
  getCSRFToken
};