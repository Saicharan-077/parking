// Import required modules
const express = require('express'); // Web framework for routing
const { body, param, query, validationResult } = require('express-validator'); // Validation middleware
const Vehicle = require('../models/Vehicle'); // Vehicle model for database operations
const { sendEmail, emailTemplates } = require('../services/emailService'); // Email service for notifications
const { sendVehicleRegistrationSMS } = require('../services/smsService'); // SMS service for notifications
const { authenticateToken } = require('../middleware/auth'); // Authentication middleware
const contentAnalysisService = require('../services/contentAnalysisService'); // Content analysis service
const emailService = require('../services/emailService'); // Enhanced email service

// Create Express router instance
const router = express.Router();

// Apply authentication middleware to all vehicle routes
router.use(authenticateToken);

// Validation rules for vehicle data input
const validateVehicleData = [
  body('vehicle_type').isIn(['car', 'bike', 'ev']).withMessage('Vehicle type must be car, bike, or ev'),
  body('vehicle_number').isLength({ min: 1 }).withMessage('Vehicle number is required'),
  body('owner_name').isLength({ min: 1 }).withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone_number').optional().isLength({ min: 1 }), // Optional phone number field
  body('employee_student_id').isLength({ min: 1 }).withMessage('Employee/Student ID is required'),
  body('model').optional().isLength({ min: 1 }), // Optional model field
  body('color').optional().isLength({ min: 1 }), // Optional color field
  body('is_ev').optional().isBoolean() // Optional electric vehicle flag
];

// Validation rules for search queries
const validateSearch = [
  query('q').isLength({ min: 1 }).withMessage('Search query is required')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/vehicles - Retrieve all vehicles with optional filtering
router.get('/', async (req, res) => {
  try {
    // Extract pagination and filter parameters from query
    const { limit = 50, offset = 0, vehicle_type, is_ev } = req.query;
    // Filter by user email for non-admin users, null for admins to see all
    const userEmail = req.user.role === 'admin' ? null : req.user.email;
    console.log('User email from token:', req.user.email);
    console.log('Filtering vehicles by email:', userEmail);

    // Prepare filter options
    const filters = {};
    if (vehicle_type) filters.vehicle_type = vehicle_type;
    if (is_ev !== undefined) filters.is_ev = is_ev === 'true';

    // Fetch vehicles from database with pagination and filtering
    const vehicles = await Vehicle.findAll(parseInt(limit), parseInt(offset), userEmail, filters);
    console.log('Vehicles fetched:', vehicles);
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Import admin authorization middleware
const { authorizeAdmin } = require('../middleware/auth');

// GET /api/vehicles/search?q=query - Search vehicles with optional filters (admin only)
router.get('/search', authorizeAdmin, validateSearch, handleValidationErrors, async (req, res) => {
  try {
    const { q, vehicle_type, is_ev } = req.query; // Extract search query and filters

    // Prepare filter options
    const filters = {};
    if (vehicle_type) filters.vehicle_type = vehicle_type;
    if (is_ev !== undefined) filters.is_ev = is_ev === 'true';

    const vehicles = await Vehicle.search(q, filters); // Perform search with filters
    res.json(vehicles);
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ error: 'Failed to search vehicles' });
  }
});

// GET /api/vehicles/stats - Retrieve vehicle statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Vehicle.getStats(); // Get aggregated statistics
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/vehicles/:id - Retrieve specific vehicle by ID
router.get('/:id', param('id').isInt().withMessage('ID must be a number'), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params; // Extract vehicle ID from URL
    const vehicle = await Vehicle.findById(id); // Find vehicle in database

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// POST /api/vehicles - Create a new vehicle record with enhanced validation and notifications
router.post('/', validateVehicleData, handleValidationErrors, async (req, res) => {
  try {
    const vehicleData = req.body; // Extract vehicle data from request body

    // Fetch user's phone number from database if not provided
    if (!vehicleData.phone_number) {
      const db = require('../database');
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT phone_number FROM users WHERE email = ?', [req.user.email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (user && user.phone_number) {
        vehicleData.phone_number = user.phone_number;
      }
    }

    // Analyze owner name for appropriateness
    if (vehicleData.owner_name) {
      const nameAnalysis = contentAnalysisService.validateContent(vehicleData.owner_name, {
        minLength: 2,
        maxLength: 100,
        requireMeaningful: true
      });

      if (!nameAnalysis.isValid) {
        return res.status(400).json({ error: `Invalid owner name: ${nameAnalysis.reason}` });
      }
    }

    // Analyze model for appropriateness if provided
    if (vehicleData.model) {
      const modelAnalysis = contentAnalysisService.validateContent(vehicleData.model, {
        minLength: 1,
        maxLength: 50,
        requireMeaningful: false // Model names can be short/special
      });

      if (!modelAnalysis.isValid) {
        return res.status(400).json({ error: `Invalid model: ${modelAnalysis.reason}` });
      }
    }

    // Analyze color for appropriateness if provided
    if (vehicleData.color) {
      const colorAnalysis = contentAnalysisService.validateContent(vehicleData.color, {
        minLength: 1,
        maxLength: 30,
        requireMeaningful: false // Color names can be short
      });

      if (!colorAnalysis.isValid) {
        return res.status(400).json({ error: `Invalid color: ${colorAnalysis.reason}` });
      }
    }

    // Check if user already has 2 vehicles registered
    const userVehicles = await Vehicle.findAll(1000, 0, req.user.email);
    if (userVehicles.length >= 2) {
      return res.status(400).json({ error: 'Maximum of 2 vehicles allowed per user' });
    }

    // Check for duplicate vehicle number before creation
    const existingVehicle = await Vehicle.findByVehicleNumber(vehicleData.vehicle_number);
    if (existingVehicle) {
      return res.status(409).json({ error: 'Vehicle number already registered' });
    }

    // Create new vehicle in database
    const newVehicle = await Vehicle.create(vehicleData);

    // Send enhanced confirmation email to vehicle owner
    try {
      await emailService.sendVehicleRegistrationEmail(vehicleData.email, vehicleData.owner_name, vehicleData);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue with registration even if email fails
    }

    // Send admin notification
    try {
      await emailService.sendAdminNotification(vehicleData, req.user.email);
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
      // Continue with registration even if admin email fails
    }

    // Send confirmation SMS to vehicle owner if phone number provided
    if (vehicleData.phone_number) {
      try {
        await sendVehicleRegistrationSMS(vehicleData.phone_number, vehicleData.vehicle_number);
      } catch (smsError) {
        console.error('Failed to send confirmation SMS:', smsError);
        // Continue with registration even if SMS fails
      }
    }

    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// PUT /api/vehicles/:id - Update an existing vehicle record
router.put('/:id', [
  param('id').isInt().withMessage('ID must be a number'), // Validate ID parameter
  ...validateVehicleData // Include vehicle data validation
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params; // Extract vehicle ID from URL
    const updateData = req.body; // Extract update data from request body

    // Verify vehicle exists before updating
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check for duplicate vehicle number if being updated
    if (updateData.vehicle_number && updateData.vehicle_number !== existingVehicle.vehicle_number) {
      const duplicateVehicle = await Vehicle.findByVehicleNumber(updateData.vehicle_number);
      if (duplicateVehicle) {
        return res.status(409).json({ error: 'Vehicle number already registered' });
      }
    }

    // Update vehicle in database
    const updatedVehicle = await Vehicle.update(id, updateData);
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// DELETE /api/vehicles/:id - Remove a vehicle record
router.delete('/:id', param('id').isInt().withMessage('ID must be a number'), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params; // Extract vehicle ID from URL

    // Verify vehicle exists before deletion
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Delete vehicle from database
    await Vehicle.delete(id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// Export the router for use in main application
module.exports = router;
