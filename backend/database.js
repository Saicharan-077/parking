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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'bike', 'ev')),
      vehicle_number TEXT UNIQUE NOT NULL,
      model TEXT,
      color TEXT,
      is_ev BOOLEAN DEFAULT 0,
      owner_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone_number TEXT,
      employee_student_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add phone_number column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE vehicles ADD COLUMN phone_number TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding phone_number column:', err);
    }
  });

  // Create users table for future authentication features
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('📊 Database tables initialized successfully'); // Log successful initialization
});

module.exports = db; // Export the database instance for use in other modules
