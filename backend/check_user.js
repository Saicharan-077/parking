const db = require('./database');

db.get('SELECT * FROM users WHERE email = ?', ['mani@example.com'], (err, row) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('User exists:', !!row);
    if (row) {
      console.log('User data:', row);
    }
  }
  process.exit(0);
});
