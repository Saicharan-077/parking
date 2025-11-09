const validator = require('validator');
const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize');

// Sanitize string input to prevent XSS
function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  
  // Remove XSS attempts
  let sanitized = xss(input, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

// Sanitize email
function sanitizeEmail(email) {
  if (typeof email !== 'string') return email;
  
  const sanitized = sanitizeString(email);
  return validator.isEmail(sanitized) ? validator.normalizeEmail(sanitized) : sanitized;
}

// Sanitize phone number
function sanitizePhoneNumber(phone) {
  if (typeof phone !== 'string') return phone;
  
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

// Sanitize vehicle number
function sanitizeVehicleNumber(vehicleNumber) {
  if (typeof vehicleNumber !== 'string') return vehicleNumber;
  
  // Allow alphanumeric characters, spaces, and hyphens only
  return vehicleNumber.replace(/[^a-zA-Z0-9\s-]/g, '').trim().toUpperCase();
}

// General input sanitization middleware
function sanitizeInputs(req, res, next) {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        switch (key) {
          case 'email':
            req.body[key] = sanitizeEmail(value);
            break;
          case 'phone_number':
          case 'phoneNumber':
            req.body[key] = sanitizePhoneNumber(value);
            break;
          case 'vehicle_number':
            req.body[key] = sanitizeVehicleNumber(value);
            break;
          default:
            req.body[key] = sanitizeString(value);
        }
      }
    }
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        req.query[key] = sanitizeString(value);
      }
    }
  }
  
  next();
}

// Rate limiting for sensitive operations
const rateLimitMap = new Map();

function rateLimit(maxRequests = 5, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(identifier)) {
      rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userLimit = rateLimitMap.get(identifier);
    
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
      return next();
    }
    
    if (userLimit.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }
    
    userLimit.count++;
    next();
  };
}

module.exports = {
  sanitizeInputs,
  sanitizeString,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeVehicleNumber,
  rateLimit,
  mongoSanitize
};