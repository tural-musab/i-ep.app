// @ts-nocheck
import { describe, it, expect } from '@jest/globals';

// Simple error classes for testing
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Simple error handler function
function handleError(error: Error): { message: string; statusCode: number; type: string } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      type: 'AppError',
    };
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      statusCode: 400,
      type: 'ValidationError',
    };
  }

  return {
    message: 'Internal Server Error',
    statusCode: 500,
    type: 'UnknownError',
  };
}

// Format error message
function formatErrorMessage(message: string, context?: Record<string, unknown>): string {
  if (!context) return message;

  const contextStr = Object.entries(context)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `${message} (Context: ${contextStr})`;
}

// Check if error is retryable
function isRetryableError(error: Error): boolean {
  if (error.message.includes('timeout')) return true;
  if (error.message.includes('ECONNRESET')) return true;
  if (error.message.includes('ENOTFOUND')) return true;
  return false;
}

describe('Error Handler Tests', () => {
  describe('handleError', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Test app error', 422);
      const result = handleError(error);

      expect(result.message).toBe('Test app error');
      expect(result.statusCode).toBe(422);
      expect(result.type).toBe('AppError');
    });

    it('should handle ValidationError correctly', () => {
      const error = new ValidationError('Invalid input');
      const result = handleError(error);

      expect(result.message).toBe('Invalid input');
      expect(result.statusCode).toBe(400);
      expect(result.type).toBe('ValidationError');
    });

    it('should handle generic Error correctly', () => {
      const error = new Error('Something went wrong');
      const result = handleError(error);

      expect(result.message).toBe('Internal Server Error');
      expect(result.statusCode).toBe(500);
      expect(result.type).toBe('UnknownError');
    });

    it('should use default status code for AppError', () => {
      const error = new AppError('Default status error');
      const result = handleError(error);

      expect(result.statusCode).toBe(500);
    });
  });

  describe('formatErrorMessage', () => {
    it('should return message without context', () => {
      const message = 'Test error';
      const result = formatErrorMessage(message);

      expect(result).toBe('Test error');
    });

    it('should format message with context', () => {
      const message = 'Test error';
      const context = { userId: '123', action: 'login' };
      const result = formatErrorMessage(message, context);

      expect(result).toBe('Test error (Context: userId: 123, action: login)');
    });

    it('should handle empty context', () => {
      const message = 'Test error';
      const context = {};
      const result = formatErrorMessage(message, context);

      expect(result).toBe('Test error (Context: )');
    });
  });

  describe('isRetryableError', () => {
    it('should return true for timeout errors', () => {
      const error = new Error('Request timeout occurred');
      const result = isRetryableError(error);

      expect(result).toBe(true);
    });

    it('should return true for connection reset errors', () => {
      const error = new Error('ECONNRESET - Connection was reset');
      const result = isRetryableError(error);

      expect(result).toBe(true);
    });

    it('should return true for DNS not found errors', () => {
      const error = new Error('ENOTFOUND - DNS lookup failed');
      const result = isRetryableError(error);

      expect(result).toBe(true);
    });

    it('should return false for validation errors', () => {
      const error = new ValidationError('Invalid email format');
      const result = isRetryableError(error);

      expect(result).toBe(false);
    });

    it('should return false for generic errors', () => {
      const error = new Error('Something went wrong');
      const result = isRetryableError(error);

      expect(result).toBe(false);
    });
  });
});
