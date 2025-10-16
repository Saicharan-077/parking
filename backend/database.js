const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Create vehicles table
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
      employee_student_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create users table for future authentication
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

  console.log('📊 Database tables initialized successfully');
});

module.exports = db;
