const http = require('http');

const token = process.env.TEST_TOKEN || 'your-test-token-here';

const data = JSON.stringify({
  vehicle_type: 'car',
  vehicle_number: 'AP1234',
  owner_name: 'Test User',
  email: process.env.TEST_EMAIL || 'test@example.com',
  employee_student_id: 'EMP001',
  model: 'Toyota Camry',
  color: 'Blue'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/v1/vehicles',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();
