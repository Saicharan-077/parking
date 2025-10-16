// Import required modules
const express = require('express'); // Web framework for routing
const bcrypt = require('bcryptjs'); // Library for password hashing
const jwt = require('jsonwebtoken'); // Library for JSON Web Tokens
const { body, validationResult } = require('express-validator'); // Middleware for request validation
const db = require('../database'); // Database connection module

// Create Express router instance
const router = express.Router();

// User registration endpoint
router.post('/register', [
  // Validation rules for request body
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract user data from request body
    const { username, email, password, role = 'user' } = req.body;

    // Check if user already exists in database
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }

    // Hash the password for security
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, username, email, role });
        }
      );
    });

    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: result.id, username: result.username, role: result.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Send success response with user data and token
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: result.id, username: result.username, email: result.email, role: result.role },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login endpoint
router.post('/login', [
  // Validation rules for login request
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract login credentials
    const { email, password } = req.body;

    // Find user in database by email
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password against hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token for authenticated user
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Send success response with user data and token
    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile endpoint
router.get('/profile', async (req, res) => {
  try {
    // Extract JWT token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Fetch user profile from database
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [decoded.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send user profile data
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the router for use in main application
module.exports = router;
