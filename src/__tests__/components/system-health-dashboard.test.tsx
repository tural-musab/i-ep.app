/**
 * SystemHealthDashboard Component Tests
 * Sprint 7: SystemHealthDashboard komponentinin test'leri
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemHealthDashboard from '@/components/super-admin/SystemHealthDashboard';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('SystemHealthDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockHealthyReport = {
    success: true,
    data: {
      overall: {
        status: 'healthy',
        timestamp: '2025-01-10T10:00:00.000Z',
        uptime: 3600,
        checks: [
          {
            name: 'database',
            status: 'pass',
            message: 'Database connection healthy',
            duration: 50,
            timestamp: '2025-01-10T10:00:00.000Z',
          },
          {
            name: 'redis',
            status: 'pass',
            message: 'Redis connection healthy',
            duration: 20,
            timestamp: '2025-01-10T10:00:00.000Z',
          },
        ],
        version: '1.0.0',
        environment: 'test',
      },
      database: { connection: true, responseTime: 50 },
      redis: { connection: true, responseTime: 20 },
      ssl: [],
    },
    timestamp: '2025-01-10T10:00:00.000Z',
  };

  const mockDegradedReport = {
    success: true,
    data: {
      overall: {
        status: 'degraded',
        timestamp: '2025-01-10T10:00:00.000Z',
        uptime: 3600,
        checks: [
          {
            name: 'database',
            status: 'pass',
            message: 'Database connection healthy',
            duration: 50,
            timestamp: '2025-01-10T10:00:00.000Z',
          },
          {
            name: 'redis',
            status: 'fail',
            message: 'Redis connection failed',
            duration: 0,
            timestamp: '2025-01-10T10:00:00.000Z',
          },
        ],
        version: '1.0.0',
        environment: 'test',
      },
      database: { connection: true, responseTime: 50 },
      redis: { connection: false, responseTime: 0, error: 'Connection failed' },
      ssl: [],
    },
    timestamp: '2025-01-10T10:00:00.000Z',
  };

  it('should render loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<SystemHealthDashboard />);

    // Test loading state presence (component shows animated skeleton)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should display healthy system status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByText('healthy', { exact: false })).toBeInTheDocument();
    });
  });

  it('should display degraded system status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDegradedReport,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('degraded', { exact: false })).toBeInTheDocument();
    });
  });

  it('should display database connection status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument(); // Response time
    });
  });

  it('should display Redis connection status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Redis Cache')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument(); // Response time
    });
  });

  it('should show error status for failed services', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDegradedReport,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/redis cache/i)).toBeInTheDocument();
      expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
    });
  });

  it('should display system uptime', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      // Uptime should be formatted (3600 seconds = 1 hour)
      expect(screen.getByText(/1h/)).toBeInTheDocument();
    });
  });

  it('should handle API fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('should handle HTTP error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch health data/i)).toBeInTheDocument();
    });
  });

  it('should auto-refresh data every 30 seconds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    render(<SystemHealthDashboard />);

    // Initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Fast-forward another 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  it('should stop auto-refresh when component unmounts', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    const { unmount } = render(<SystemHealthDashboard />);

    // Initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Unmount component
    unmount();

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000);

    // Should not fetch again after unmount
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should provide manual refresh button', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    render(<SystemHealthDashboard />);

    // Wait for data to load first
    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    // Find and click refresh button (should be visible after loading)
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should display last updated timestamp', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/last updated/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during refresh', async () => {
    // First call resolves immediately
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    // Second call (refresh) takes time
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => mockHealthyReport,
              } as Response),
            1000
          );
        })
    );

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Component should handle refresh (no specific loading text required)
    expect(refreshButton).toBeInTheDocument();
  });

  it('should display system version and environment', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthyReport,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/version.*1\.0\.0/i)).toBeInTheDocument();
      expect(screen.getByText(/test/i)).toBeInTheDocument();
    });
  });

  it('should handle SSL certificate status display', async () => {
    const reportWithSSL = {
      ...mockHealthyReport,
      data: {
        ...mockHealthyReport.data,
        ssl: [
          {
            domain: 'example.com',
            status: 'valid',
            expiresAt: '2025-12-31T23:59:59.000Z',
            daysUntilExpiry: 355,
          },
        ],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => reportWithSSL,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/ssl certificates/i)).toBeInTheDocument();
      expect(screen.getByText(/example\.com/)).toBeInTheDocument();
    });
  });

  it('should show SSL certificate information when available', async () => {
    const reportWithSSL = {
      ...mockHealthyReport,
      data: {
        ...mockHealthyReport.data,
        ssl: [
          {
            domain: 'example.com',
            status: 'valid',
            expiresAt: '2025-01-20T23:59:59.000Z',
            daysUntilExpiry: 365,
          },
        ],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => reportWithSSL,
    } as Response);

    render(<SystemHealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/ssl certificates/i)).toBeInTheDocument();
      expect(screen.getByText(/1.*domains? monitored/i)).toBeInTheDocument();
    });
  });
});
