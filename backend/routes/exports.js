// Import required modules
const express = require('express'); // Web framework for routing
const createCsvWriter = require('csv-writer').createObjectCsvWriter; // CSV file writer library
const PDFDocument = require('pdfkit'); // PDF document generation library
const fs = require('fs'); // Node.js file system module
const path = require('path'); // Node.js path module
const Vehicle = require('../models/Vehicle'); // Vehicle model for database operations
const { authenticateToken, authorizeAdmin } = require('../middleware/auth'); // Authentication middleware

// Create Express router instance
const router = express.Router();

// Apply authentication middleware to all export routes
router.use(authenticateToken);

// GET /api/exports/vehicles/csv - Export vehicle data as CSV file (admin only)
router.get('/vehicles/csv', authorizeAdmin, async (req, res) => {
  try {
    // Retrieve all vehicles from database for export (up to 1000 records)
    const vehicles = await Vehicle.findAll(1000, 0);

    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'No vehicles found to export' });
    }

    // Configure CSV writer with column headers
    const csvWriter = createCsvWriter({
      path: 'temp_vehicles.csv', // Temporary file path
      header: [
        { id: 'vehicle_number', title: 'Vehicle Number' },
        { id: 'vehicle_type', title: 'Vehicle Type' },
        { id: 'owner_name', title: 'Owner Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone_number', title: 'Phone Number' }
      ]
    });

    // Generate CSV file with vehicle data
    await csvWriter.writeRecords(vehicles);

    // Set HTTP headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="vehicles_export.csv"');

    // Stream the CSV file to the client
    const fileStream = fs.createReadStream('temp_vehicles.csv');
    fileStream.pipe(res);

    // Remove temporary file after streaming completes
    fileStream.on('end', () => {
      fs.unlinkSync('temp_vehicles.csv');
    });

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// GET /api/exports/vehicles/pdf - Export vehicle data as PDF report (admin only)
router.get('/vehicles/pdf', authorizeAdmin, async (req, res) => {
  try {
    // Retrieve all vehicles from database for export
    const vehicles = await Vehicle.findAll(1000, 0);

    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'No vehicles found to export' });
    }

    // Initialize PDF document with A4 size and margins
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = 'vehicles_export.pdf';

    // Set HTTP headers for PDF file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF content directly to response stream
    doc.pipe(res);

    // Add report header
    doc.fontSize(20).text('VNR Parking Pilot - Vehicle Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Define table layout parameters
    const tableTop = 150;
    const colWidths = [50, 80, 80, 80, 50, 80, 100, 80];
    let currentY = tableTop;

    // Create table header with background
    doc.font('Helvetica-Bold');
    doc.rect(50, currentY - 5, 500, 25).fill('#f0f0f0').stroke();
    doc.fillColor('black').fontSize(10);

    // Draw column headers
    let xPos = 50;
    const headers = ['ID', 'Type', 'Number', 'Model', 'Color', 'EV', 'Owner', 'Email'];
    headers.forEach((header, i) => {
      doc.text(header, xPos + 5, currentY + 5, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });

    currentY += 25;

    // Generate table rows for each vehicle
    doc.font('Helvetica');
    vehicles.forEach((vehicle, index) => {
      // Alternate row background colors for readability
      if (index % 2 === 0) {
        doc.rect(50, currentY - 5, 500, 20).fill('#f9f9f9').stroke();
      }

      // Prepare row data
      xPos = 50;
      const rowData = [
        vehicle.id.toString(),
        vehicle.vehicle_type.toUpperCase(),
        vehicle.vehicle_number,
        vehicle.model || 'N/A',
        vehicle.color || 'N/A',
        vehicle.is_ev ? 'Yes' : 'No',
        vehicle.owner_name,
        vehicle.email
      ];

      // Draw each cell in the row
      rowData.forEach((data, i) => {
        doc.fillColor('black').text(data, xPos + 5, currentY + 2, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });

      currentY += 20;

      // Add new page if content exceeds page height
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });

    // Add summary statistics section
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Total Vehicles: ${vehicles.length}`, 50, currentY);
    doc.text(`EV Vehicles: ${vehicles.filter(v => v.is_ev).length}`, 200, currentY);
    doc.text(`Regular Vehicles: ${vehicles.filter(v => !v.is_ev).length}`, 350, currentY);

    // Add footer with generation info
    doc.fontSize(8).fillColor('gray');
    doc.text('Generated by VNR Parking Pilot System', 50, doc.page.height - 50, { align: 'center' });

    // Finalize and close the PDF document
    doc.end();

  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// GET /api/exports/stats - Retrieve export statistics (admin only)
router.get('/stats', authorizeAdmin, async (req, res) => {
  try {
    // Get vehicle statistics from database
    const stats = await Vehicle.getStats();

    // Return formatted statistics with timestamp
    res.json({
      totalVehicles: stats.total_vehicles,
      evVehicles: stats.total_ev,
      carVehicles: stats.total_cars,
      bikeVehicles: stats.total_bikes,
      exportDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Export stats error:', error);
    res.status(500).json({ error: 'Failed to get export statistics' });
  }
});

// Export the router for use in main application
module.exports = router;
