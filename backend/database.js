// Import required modules
const sqlite3 = require('sqlite3').verbose(); // SQLite3 database driver with verbose error messages
const path = require('path'); // Node.js path module for file path operations

// Define database file path
const dbPath = path.join(__dirname, 'database.sqlite'); // Path to SQLite database file
const db = new sqlite3.Database(dbPath); // Create or open the database file

// Initialize database tables
db.serialize(() => { // Execute database operations sequentially
  // Create vehicles table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT, // Auto-incrementing primary key
      vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'bike', 'ev')), // Vehicle type with constraints
      vehicle_number TEXT UNIQUE NOT NULL, // Unique vehicle registration number
      model TEXT, // Vehicle model (optional)
      color TEXT, // Vehicle color (optional)
      is_ev BOOLEAN DEFAULT 0, // Electric vehicle flag (default false)
      owner_name TEXT NOT NULL, // Owner's full name
      email TEXT NOT NULL, // Owner's email address
      employee_student_id TEXT NOT NULL, // Employee or student ID
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, // Record creation timestamp
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP // Record update timestamp
    )
  `);

  // Create users table for future authentication features
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, // Auto-incrementing primary key
      username TEXT UNIQUE NOT NULL, // Unique username
      email TEXT UNIQUE NOT NULL, // Unique email address
      password TEXT NOT NULL, // Hashed password
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')), // User role with constraints
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP // Account creation timestamp
    )
  `);

  console.log('📊 Database tables initialized successfully'); // Log successful initialization
});

module.exports = db; // Export the database instance for use in other modules
