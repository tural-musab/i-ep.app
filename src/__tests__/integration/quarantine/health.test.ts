// @ts-nocheck
import { describe, it, expect, beforeEach } from '@jest/globals';

// NextResponse mock'la
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: jest.fn().mockResolvedValue(data),
      status: init?.status || 200,
      ok: (init?.status || 200) < 400,
    })),
  },
}));

// Supabase client mock'la
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '@/lib/supabase/client';
import { GET as healthGET } from '@/app/api/health/route';
import { GET as readyGET } from '@/app/api/ready/route';

describe('Health Check API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('başarılı health check döndürmelidir', async () => {
      // Act
      const response = await healthGET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('version');
      expect(data.version).toBe('0.1.0');
      expect(data.checks).toEqual({
        database: 'healthy',
        redis: 'healthy',
        externalApis: 'healthy',
      });
    });
  });

  describe('GET /api/ready', () => {
    it('başarılı DB bağlantısında ready status döndürmelidir', async () => {
      // Arrange - Supabase mock'ını başarılı response için ayarla
      const mockSelect = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      // Act
      const response = await readyGET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.status).toBe('ready');
      expect(data.dbConnection).toBe(true);
      expect(data).toHaveProperty('timestamp');
    });

    it('DB bağlantı hatası durumunda not_ready status döndürmelidir', async () => {
      // Arrange - Supabase mock'ını hata response için ayarla
      const mockSelect = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      // Act
      const response = await readyGET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.status).toBe('not_ready');
      expect(data.dbConnection).toBe(false);
      expect(data).toHaveProperty('timestamp');
    });

    it('exception fırlatıldığında not_ready status döndürmelidir', async () => {
      // Arrange - Supabase mock'ını exception fırlatacak şekilde ayarla
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Connection timeout');
      });

      // Act
      const response = await readyGET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.status).toBe('not_ready');
      expect(data.dbConnection).toBe(false);
      expect(data).toHaveProperty('timestamp');
    });
  });
});
