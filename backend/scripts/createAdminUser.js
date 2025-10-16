// Import required modules
const bcrypt = require('bcryptjs'); // Library for password hashing
const db = require('../database'); // Database connection module

// Asynchronous function to create an admin user in the database
async function createAdminUser() {
  // Define admin user credentials
  const username = 'mani';
  const email = 'mani@example.com';
  const password = 'mani123';
  const role = 'admin';

  try {
    // Check if admin user already exists in database
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      console.log('Admin user already exists.');
      process.exit(0); // Exit successfully if user exists
    }

    // Hash the password for security
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new admin user into database
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

    console.log('Admin user created successfully.');
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1); // Exit with error code
  }
}

// Execute the admin user creation function
createAdminUser();
