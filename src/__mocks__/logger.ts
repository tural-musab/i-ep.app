// Mock for middleware logger
const mockRequestLogger = {
  startTime: Date.now(),
  finish: jest.fn(),
};

const createRequestLogger = jest.fn(() => mockRequestLogger);

const logRequest = jest.fn();

module.exports = {
  createRequestLogger,
  logRequest,
  mockRequestLogger,
};
