const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const { sendEmail, emailTemplates } = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all vehicle routes
router.use(authenticateToken);

// Validation middleware
const validateVehicleData = [
  body('vehicle_type').isIn(['car', 'bike', 'ev']).withMessage('Vehicle type must be car, bike, or ev'),
  body('vehicle_number').isLength({ min: 1 }).withMessage('Vehicle number is required'),
  body('owner_name').isLength({ min: 1 }).withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('employee_student_id').isLength({ min: 1 }).withMessage('Employee/Student ID is required'),
  body('model').optional().isLength({ min: 1 }),
  body('color').optional().isLength({ min: 1 }),
  body('is_ev').optional().isBoolean()
];

const validateSearch = [
  query('q').isLength({ min: 1 }).withMessage('Search query is required')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/vehicles - Get all vehicles (filtered by user email for non-admin users)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const userEmail = req.user.role === 'admin' ? null : req.user.email;
    console.log('User email from token:', req.user.email);
    console.log('Filtering vehicles by email:', userEmail);
    const vehicles = await Vehicle.findAll(parseInt(limit), parseInt(offset), userEmail);
    console.log('Vehicles fetched:', vehicles);
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

const { authorizeAdmin } = require('../middleware/auth');

// GET /api/vehicles/search?q=query - Search vehicles
router.get('/search', authorizeAdmin, validateSearch, handleValidationErrors, async (req, res) => {
  try {
    const { q } = req.query;
    const vehicles = await Vehicle.search(q);
    res.json(vehicles);
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ error: 'Failed to search vehicles' });
  }
});

// GET /api/vehicles/stats - Get vehicle statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Vehicle.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/vehicles/:id - Get vehicle by ID
router.get('/:id', param('id').isInt().withMessage('ID must be a number'), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// POST /api/vehicles - Create new vehicle
router.post('/', validateVehicleData, handleValidationErrors, async (req, res) => {
  try {
    const vehicleData = req.body;

    // Check if vehicle number already exists
    const existingVehicle = await Vehicle.findByVehicleNumber(vehicleData.vehicle_number);
    if (existingVehicle) {
      return res.status(409).json({ error: 'Vehicle number already registered' });
    }

    const newVehicle = await Vehicle.create(vehicleData);

    // Send confirmation email
    try {
      await sendEmail(vehicleData.email, emailTemplates.vehicleRegistration, {
        ...vehicleData,
        vehicle_type: vehicleData.vehicle_type.toUpperCase()
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// PUT /api/vehicles/:id - Update vehicle
router.put('/:id', [
  param('id').isInt().withMessage('ID must be a number'),
  ...validateVehicleData
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // If updating vehicle number, check if it's already taken
    if (updateData.vehicle_number && updateData.vehicle_number !== existingVehicle.vehicle_number) {
      const duplicateVehicle = await Vehicle.findByVehicleNumber(updateData.vehicle_number);
      if (duplicateVehicle) {
        return res.status(409).json({ error: 'Vehicle number already registered' });
      }
    }

    const updatedVehicle = await Vehicle.update(id, updateData);
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', param('id').isInt().withMessage('ID must be a number'), handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await Vehicle.delete(id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

module.exports = router;
