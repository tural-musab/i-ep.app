/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Jest polyfills for Web APIs
 * Provides missing browser APIs in Node.js test environment
 */

// Web Streams API polyfill for MSW
try {
  if (typeof global.TransformStream === 'undefined') {
    const streams = require('stream/web');
    global.TransformStream = streams.TransformStream;
    global.ReadableStream = streams.ReadableStream;
    global.WritableStream = streams.WritableStream;
  }
} catch (error) {
  console.warn('Web Streams API not available, skipping polyfill');
}

// TextEncoder/TextDecoder for Node.js < 18
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Fetch API polyfill
if (typeof global.fetch === 'undefined') {
  global.fetch = require('whatwg-fetch').fetch;
  global.Request = require('whatwg-fetch').Request;
  global.Response = require('whatwg-fetch').Response;
  global.Headers = require('whatwg-fetch').Headers;
}

// URL polyfill for older Node.js versions
if (typeof global.URL === 'undefined') {
  global.URL = require('url').URL;
  global.URLSearchParams = require('url').URLSearchParams;
}

// AbortController/AbortSignal for fetch cancellation
if (typeof global.AbortController === 'undefined') {
  const AbortController = require('abort-controller');
  global.AbortController = AbortController.AbortController;
  global.AbortSignal = AbortController.AbortSignal;
}

// MockDocumentType to prevent jsdom warnings
if (typeof global.DocumentType === 'undefined') {
  global.DocumentType = class DocumentType {};
}
