const bcrypt = require('bcryptjs');
const db = require('../database');

async function createAdminUser() {
  const username = 'mani';
  const email = 'mani@example.com';
  const password = 'mani123';
  const role = 'admin';

  try {
    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
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
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
