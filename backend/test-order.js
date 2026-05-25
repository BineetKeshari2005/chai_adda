const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // I need a valid token to bypass auth. I'll just check if Razorpay is crashing instead.
  }
}
