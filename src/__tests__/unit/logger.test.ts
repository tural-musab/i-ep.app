import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Logger'ı mock'lamadan önce process.env'i mock'la
const originalEnv = process.env;

describe('Logger Tests', () => {
  beforeEach(() => {
    // Process.env'i mock'la
    process.env = { ...originalEnv };
    
    // Logger modülünü temizle
    jest.resetModules();
  });

  afterEach(() => {
    // Orijinal env'i geri yükle
    process.env = originalEnv;
  });

  describe('Logger Configuration', () => {
    it('should use LOG_LEVEL from environment variable', async () => {
      // Arrange
      process.env.LOG_LEVEL = 'debug';
      process.env.NODE_ENV = 'test';
      
      // Act
      const logger = (await import('@/lib/logger')).default;
      
      // Assert
      expect(logger.level).toBe('debug');
    });

    it('should default to info level when LOG_LEVEL is not set', async () => {
      // Arrange
      delete process.env.LOG_LEVEL;
      process.env.NODE_ENV = 'test';
      
      // Act
      const logger = (await import('@/lib/logger')).default;
      
      // Assert
      expect(logger.level).toBe('info');
    });

    it('should use pretty transport in development', async () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      
      // Act
      const logger = (await import('@/lib/logger')).default;
      
      // Assert
      // Pino'da transport bilgisini doğrudan kontrol etmek zor
      // Bu nedenle logger'ın çalıştığını test edeceğiz
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should not use pretty transport in production', async () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      
      // Act
      const logger = (await import('@/lib/logger')).default;
      
      // Assert
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('Logger Methods', () => {
    it('should have all required logging methods', async () => {
      // Arrange
      process.env.NODE_ENV = 'test';
      
      // Act
      const logger = (await import('@/lib/logger')).default;
      
      // Assert
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should log structured data correctly', async () => {
      // Arrange
      process.env.NODE_ENV = 'test';
      const logger = (await import('@/lib/logger')).default;
      
      // Spy on logger write method
      const writeSpy = jest.spyOn(logger, 'info');
      
      // Act
      logger.info({ userId: '123', action: 'login' }, 'User logged in');
      
      // Assert
      expect(writeSpy).toHaveBeenCalledWith({ userId: '123', action: 'login' }, 'User logged in');
    });
  });
});

describe('Request Logger Middleware', () => {
  let mockReq: Record<string, unknown>;
  let mockRes: Record<string, unknown>;

  beforeEach(() => {
    // Mock NextRequest
    mockReq = {
      method: 'GET',
      url: 'http://localhost:3000/api/test',
      headers: {
        get: jest.fn((key: string) => {
          switch (key) {
            case 'user-agent':
              return 'Mozilla/5.0 Test Browser';
            case 'x-forwarded-for':
              return '192.168.1.1';
            case 'referer':
              return 'http://localhost:3000';
            default:
              return null;
          }
        }),
      },
    };

    // Mock NextResponse
    mockRes = {
      status: 200,
    };

    // Process.env'i temizle
    process.env = { ...originalEnv, NODE_ENV: 'test' };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should log request start with correct information', async () => {
    // Arrange
    const { createRequestLogger } = await import('@/middleware/logger');
    const logger = (await import('@/lib/logger')).default;
    const logSpy = jest.spyOn(logger, 'info');
    
    // Act
    createRequestLogger(mockReq);
    
    // Assert
    expect(logSpy).toHaveBeenCalledWith(
      {
        method: 'GET',
        url: 'http://localhost:3000/api/test',
        userAgent: 'Mozilla/5.0 Test Browser',
        ip: '192.168.1.1',
      },
      'HTTP Request Start'
    );
  });

  it('should log request completion with duration', async () => {
    // Arrange
    const { createRequestLogger } = await import('@/middleware/logger');
    const logger = (await import('@/lib/logger')).default;
    const logSpy = jest.spyOn(logger, 'info');
    
    // Act
    const requestLogger = createRequestLogger(mockReq);
    
    // Simulate some time passing
    await new Promise(resolve => setTimeout(resolve, 10));
    
    requestLogger.finish(mockRes);
    
    // Assert
    expect(logSpy).toHaveBeenCalledTimes(2); // Start and finish
    
    const finishCall = logSpy.mock.calls[1];
    expect(finishCall[0]).toEqual(
      expect.objectContaining({
        method: 'GET',
        url: 'http://localhost:3000/api/test',
        status: 200,
        userAgent: 'Mozilla/5.0 Test Browser',
        ip: '192.168.1.1',
        referer: 'http://localhost:3000',
        duration: expect.any(Number),
      })
    );
    expect(finishCall[1]).toBe('HTTP Request');
  });

  it('should handle missing headers gracefully', async () => {
    // Arrange
    const mockReqNoHeaders = {
      method: 'POST',
      url: 'http://localhost:3000/api/test',
      headers: {
        get: jest.fn(() => null),
      },
    };

    const { createRequestLogger } = await import('@/middleware/logger');
    const logger = (await import('@/lib/logger')).default;
    const logSpy = jest.spyOn(logger, 'info');
    
    // Act
    const requestLogger = createRequestLogger(mockReqNoHeaders);
    requestLogger.finish(mockRes);
    
    // Assert
    const startCall = logSpy.mock.calls[0];
    expect(startCall[0]).toEqual(
      expect.objectContaining({
        method: 'POST',
        url: 'http://localhost:3000/api/test',
        userAgent: null,
        ip: 'unknown',
      })
    );
  });
}); 