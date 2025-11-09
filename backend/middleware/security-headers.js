// Additional security headers to prevent information disclosure
function securityResponseHeaders(req, res, next) {
  // Remove server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Prevent information disclosure
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Hide technology stack
  res.setHeader('Server', 'VNR-Parking-System');
  
  next();
}

module.exports = { securityResponseHeaders };