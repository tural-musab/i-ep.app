#!/usr/bin/env node

/**
 * Health Check Script for İ-EP.APP Docker Container
 *
 * This script verifies that the Next.js application is running properly
 * and responds to HTTP requests within the Docker container.
 */

const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  console.log(`Health check response status: ${res.statusCode}`);

  if (res.statusCode === 200) {
    console.log('✅ Health check passed');
    process.exit(0);
  } else {
    console.log('❌ Health check failed - Non-200 status code');
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('❌ Health check failed - Request error:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('❌ Health check failed - Request timeout');
  request.destroy();
  process.exit(1);
});

request.setTimeout(2000);
request.end();
