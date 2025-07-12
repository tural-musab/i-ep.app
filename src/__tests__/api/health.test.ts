import { GET } from '@/app/api/health/route';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  error: jest.fn(),
}));

// Mock package.json
jest.mock('../../../../package.json', () => ({
  version: '1.0.0-test',
}));

describe('Health Check API', () => {
  const mockLogger = logger as jest.Mocked<typeof logger>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-10T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return healthy status with all checks passing', async () => {
    const response = await GET();
    const json = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(json).toEqual({
      status: 'healthy',
      timestamp: '2025-01-10T12:00:00.000Z',
      version: '1.0.0-test',
      checks: {
        database: 'healthy',
        redis: 'healthy',
        externalApis: 'healthy',
      },
    });
  });

  it('should have correct response headers', async () => {
    const response = await GET();
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
  });

  it('should handle errors gracefully', async () => {
    // Force an error by mocking Date constructor
    const errorMessage = 'Test error';
    const originalDate = global.Date;
    global.Date = jest.fn(() => {
      throw new Error(errorMessage);
    }) as jest.MockedFunction<typeof Date>;

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.status).toBe('unhealthy');
    expect(json.error).toBe(errorMessage);
    expect(mockLogger.error).toHaveBeenCalledWith(
      { err: expect.any(Error) },
      'Health check hatası'
    );

    // Restore Date
    global.Date = originalDate;
  });

  it('should handle non-Error exceptions', async () => {
    // Force a non-Error exception
    const originalDate = global.Date;
    global.Date = jest.fn(() => {
      throw 'String error';
    }) as jest.MockedFunction<typeof Date>;

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.status).toBe('unhealthy');
    expect(json.error).toBe('Bilinmeyen hata');

    // Restore Date
    global.Date = originalDate;
  });
});
