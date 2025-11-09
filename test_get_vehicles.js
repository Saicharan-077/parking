const http = require('http');

const token = process.env.TEST_TOKEN || 'your-test-token-here';

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/v1/vehicles',
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
