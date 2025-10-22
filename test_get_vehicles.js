const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJtYW5pIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJtYW5pQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwNjQwNzkxLCJleHAiOjE3NjEyNDU1OTF9.CPKOsjjLtTxjXUvWYvO9hSxzvO6JHvUqykFW49slM0U';

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/vehicles',
  method: 'GET',
  headers: {
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

req.end();
