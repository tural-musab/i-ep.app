/**
 * Sentry Mock for Jest Tests
 * Sprint 7: Test environment için Sentry mock'u
 */

module.exports = {
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  configureScope: jest.fn(),
  addBreadcrumb: jest.fn(),
  withScope: jest.fn((callback) => callback()),
  setTag: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  init: jest.fn(),
  startSpan: jest.fn((options, callback) => {
    return callback({
      setAttribute: jest.fn(),
      setStatus: jest.fn(),
      end: jest.fn()
    });
  }),
  getCurrentHub: jest.fn(() => ({
    getClient: jest.fn(),
    getScope: jest.fn()
  })),
  logger: {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    fmt: jest.fn((template, ...args) => {
      // Simple template literal mock
      return template.replace(/\$\{(\d+)\}/g, (match, index) => args[index] || match);
    })
  }
}; 