import 'whatwg-fetch';
global.BroadcastChannel = jest.fn(() => ({
  postMessage: jest.fn(),
  close: jest.fn(),
  onmessage: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Jest DOM'u içe aktarma
import '@testing-library/jest-dom';

// TextEncoder/TextDecoder polyfill - Node.js'te eksik olabilir
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Global ortam değişkenlerini ayarla
process.env = {
  ...process.env,
  NEXT_PUBLIC_DOMAIN: 'i-ep.app',
  NODE_ENV: 'test',
  NEXT_PUBLIC_APP_NAME: 'i-ep.app',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-secret-key-for-testing-purposes-only-32chars',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
}; 