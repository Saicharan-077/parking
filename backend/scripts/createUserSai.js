// Import required modules
const bcrypt = require('bcryptjs'); // Library for password hashing
const db = require('../database'); // Database connection module

// Asynchronous function to create a regular user 'sai' in the database
async function createUserSai() {
  // Define user credentials
  const username = 'sai';
  const email = 'sai@example.com';
  const password = 'sai123';
  const role = 'user'; // Regular user role without admin permissions

  try {
    // Check if user already exists in database
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      console.log('User sai already exists.');
      process.exit(0); // Exit successfully if user exists
    }

    // Hash the password for security
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log('User sai created successfully.');
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error('Error creating user sai:', error);
    process.exit(1); // Exit with error code
  }
}

// Execute the user creation function
createUserSai();
