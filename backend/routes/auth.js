// Import required modules
const express = require('express'); // Web framework for routing
const bcrypt = require('bcryptjs'); // Library for password hashing
const jwt = require('jsonwebtoken'); // Library for JSON Web Tokens
const { body, validationResult } = require('express-validator'); // Middleware for request validation
const db = require('../database'); // Database connection module
const { sendEmailVerification, sendPhoneVerification, verifyEmailOTP, verifyPhoneOTP } = require('../services/verificationService'); // Verification service
const verifyGoogleToken = require('../middleware/verifyGoogleToken'); // Google OAuth middleware
const emailService = require('../services/emailService'); // Email service
const contentAnalysisService = require('../services/contentAnalysisService'); // Content analysis service

// Create Express router instance
const router = express.Router();

// Send email verification OTP endpoint
router.post('/send-email-verification', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phoneNumber').isLength({ min: 10 }).withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const result = await sendEmailVerification(email, phoneNumber);
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(500).json({ error: 'Failed to send verification code' });
    }

  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send phone verification OTP endpoint
router.post('/send-phone-verification', [
  body('phoneNumber').isLength({ min: 10 }).withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber } = req.body;
    const result = await sendPhoneVerification(phoneNumber);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(500).json({ error: 'Failed to send verification code' });
    }

  } catch (error) {
    console.error('Send phone verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify email OTP endpoint
router.post('/verify-email-otp', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;
    const result = verifyEmailOTP(email, otp);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify phone OTP endpoint
router.post('/verify-phone-otp', [
  body('phoneNumber').isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, otp } = req.body;
    const result = verifyPhoneOTP(phoneNumber, otp);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Verify phone OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User registration endpoint
router.post('/register', [
  // Validation rules for request body
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').custom((email) => {
    if (!email.endsWith('@vnrvjiet.in')) {
      throw new Error('Only VNR VJIET email addresses are allowed');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber').optional().isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('employeeStudentId').isLength({ min: 1 }).withMessage('Employee/Student ID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract user data from request body
    const { username, email, password, phoneNumber, employeeStudentId, role = 'user' } = req.body;

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
        'INSERT INTO users (username, email, password, role, phone_number, employee_student_id) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, phoneNumber || null, employeeStudentId],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, username, email, role, phoneNumber, employeeStudentId });
        }
      );
    });

    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: result.id, username: result.username, role: result.role, email: result.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Send success response with user data and token
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: result.id, username: result.username, email: result.email, role: result.role, phoneNumber: result.phoneNumber, employeeStudentId: result.employeeStudentId },
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
      db.get('SELECT id, username, email, role, phone_number, employee_student_id, profile_picture, created_at FROM users WHERE id = ?', [decoded.id], (err, row) => {
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

// Update user profile endpoint
router.put('/profile', [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('phoneNumber').optional().isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('employeeStudentId').optional().isLength({ min: 1 }).withMessage('Employee/Student ID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract JWT token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const { username, phoneNumber, employeeStudentId, profilePicture } = req.body;

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE username = ? AND id != ?', [username, decoded.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Update user profile in database
    const updateFields = [];
    const updateValues = [];

    if (username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (phoneNumber !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(phoneNumber);
    }
    if (employeeStudentId !== undefined) {
      updateFields.push('employee_student_id = ?');
      updateValues.push(employeeStudentId);
    }
    if (profilePicture !== undefined) {
      updateFields.push('profile_picture = ?');
      updateValues.push(profilePicture);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(decoded.id);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues,
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Fetch updated user profile
    const updatedUser = await new Promise((resolve, reject) => {
      db.get('SELECT id, username, email, role, phone_number, employee_student_id, profile_picture, created_at FROM users WHERE id = ?', [decoded.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Send success response with updated user data
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth login endpoint
router.post('/google-login', verifyGoogleToken, async (req, res) => {
  try {
    const { googleId, email, name, picture, emailVerified } = req.googleUser;

    if (!emailVerified) {
      return res.status(400).json({ error: 'Email not verified with Google' });
    }

    // Check if user exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ? OR google_id = ?', [email, googleId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    let user;
    if (existingUser) {
      // Update Google ID if not set
      if (!existingUser.google_id) {
        await new Promise((resolve, reject) => {
          db.run('UPDATE users SET google_id = ?, picture = ? WHERE id = ?',
            [googleId, picture, existingUser.id], function(err) {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      user = existingUser;
    } else {
      // Create new user
      const username = email.split('@')[0] + '_' + Date.now();
      const role = 'user'; // Default role

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, email, google_id, role, picture, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [username, email, googleId, role, picture, new Date().toISOString()],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Get the created user
      const userId = await new Promise((resolve, reject) => {
        db.get('SELECT last_insert_rowid() as id', [], (err, row) => {
          if (err) reject(err);
          else resolve(row.id);
        });
      });

      user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(email, name);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        picture: user.picture
      },
      token
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced signup with content analysis and email notifications
router.post('/signup', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('employeeStudentId').notEmpty().withMessage('Employee/Student ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, employeeStudentId } = req.body;

    // Analyze username for appropriateness
    const usernameAnalysis = contentAnalysisService.validateContent(username, {
      minLength: 3,
      maxLength: 50,
      requireMeaningful: false // Usernames can be creative
    });

    if (!usernameAnalysis.isValid) {
      return res.status(400).json({ error: `Invalid username: ${usernameAnalysis.reason}` });
    }

    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password, employee_student_id, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, employeeStudentId, 'user', new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(email, username);

    res.status(201).json({
      message: 'User registered successfully. Please check your email for confirmation.'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Store reset token in database
    const expiryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [resetToken, expiryTime.toISOString(), user.id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(email, resetToken);

    if (emailResult.success) {
      res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
      res.status(500).json({ error: 'Failed to send password reset email' });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password endpoint
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token exists in database and hasn't expired
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ? AND reset_token = ? AND reset_token_expiry > ?', [decoded.id, token, new Date().toISOString()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [hashedPassword, user.id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the router for use in main application
module.exports = router;
