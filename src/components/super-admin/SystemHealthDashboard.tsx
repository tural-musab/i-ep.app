/**
 * System Health Dashboard Component
 * Sprint 7: Super Admin Paneli - Sistem Sağlığı Dashboard'u
 *
 * Bu komponent sistem sağlığı bilgilerini gösterir:
 * - Database durumu
 * - Redis cache durumu
 * - SSL sertifika durumları
 * - Genel sistem metrikleri
 * - Real-time güncellemeler
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  duration: number;
  timestamp: string;
}

interface DatabaseHealth {
  connection: boolean;
  responseTime: number;
  activeConnections?: number;
  maxConnections?: number;
  lastQuery?: string;
}

interface RedisHealth {
  connection: boolean;
  responseTime: number;
  keyCount?: number;
  memoryUsage?: {
    used: number;
    max: number;
    percentage: number;
  };
}

interface SSLHealth {
  domain: string;
  isValid: boolean;
  expiresAt?: string;
  daysUntilExpiry?: number;
  issuer?: string;
  status: 'valid' | 'expiring' | 'expired' | 'invalid';
}

interface SystemHealthData {
  overall: {
    status: 'healthy' | 'degraded' | 'down';
    timestamp: string;
    uptime: number;
    checks: HealthCheck[];
    version: string;
    environment: string;
  };
  database: DatabaseHealth;
  redis: RedisHealth;
  ssl: SSLHealth[];
}

const SystemHealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/super-admin/system-health', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`, // Gerçek implementasyonda güvenli auth
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }

      const result = await response.json();
      setHealthData(result.data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealthData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
      case 'valid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
      case 'warn':
      case 'expiring':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down':
      case 'fail':
      case 'expired':
      case 'invalid':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
      case 'valid':
        return <CheckCircle className="h-5 w-5" />;
      case 'degraded':
      case 'warn':
      case 'expiring':
        return <AlertTriangle className="h-5 w-5" />;
      case 'down':
      case 'fail':
      case 'expired':
      case 'invalid':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-8 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center">
          <AlertTriangle className="mr-3 h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-medium text-red-900">System Health Check Failed</h3>
            <p className="mt-1 text-red-700">{error}</p>
            <button
              onClick={fetchHealthData}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!healthData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <p className="mt-1 text-gray-600">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
          </label>

          <button
            onClick={fetchHealthData}
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div
        className={cn(
          'rounded-lg border-2 bg-white p-6',
          getStatusColor(healthData.overall.status)
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(healthData.overall.status)}
            <div className="ml-3">
              <h3 className="text-lg font-semibold capitalize">
                System {healthData.overall.status}
              </h3>
              <p className="text-sm opacity-75">
                Uptime: {formatUptime(healthData.overall.uptime)} • Version{' '}
                {healthData.overall.version} •{healthData.overall.environment}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">
              {healthData.overall.status === 'healthy'
                ? '✓'
                : healthData.overall.status === 'degraded'
                  ? '⚠'
                  : '✗'}
            </div>
          </div>
        </div>
      </div>

      {/* Component Status Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Database Health */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <div
              className={cn(
                'rounded-lg p-2',
                healthData.database.connection ? 'bg-green-100' : 'bg-red-100'
              )}
            >
              <Database
                className={cn(
                  'h-6 w-6',
                  healthData.database.connection ? 'text-green-600' : 'text-red-600'
                )}
              />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Database</h3>
              <p className="text-sm text-gray-600">PostgreSQL via Supabase</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={cn(
                  'text-sm font-medium',
                  healthData.database.connection ? 'text-green-600' : 'text-red-600'
                )}
              >
                {healthData.database.connection ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium text-gray-900">
                {healthData.database.responseTime}ms
              </span>
            </div>

            {healthData.database.activeConnections && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connections</span>
                <span className="text-sm font-medium text-gray-900">
                  {healthData.database.activeConnections}/{healthData.database.maxConnections}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Redis Health */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <div
              className={cn(
                'rounded-lg p-2',
                healthData.redis.connection ? 'bg-green-100' : 'bg-red-100'
              )}
            >
              <Server
                className={cn(
                  'h-6 w-6',
                  healthData.redis.connection ? 'text-green-600' : 'text-red-600'
                )}
              />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Redis Cache</h3>
              <p className="text-sm text-gray-600">In-memory data store</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={cn(
                  'text-sm font-medium',
                  healthData.redis.connection ? 'text-green-600' : 'text-red-600'
                )}
              >
                {healthData.redis.connection ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium text-gray-900">
                {healthData.redis.responseTime}ms
              </span>
            </div>

            {healthData.redis.keyCount && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Keys</span>
                <span className="text-sm font-medium text-gray-900">
                  {healthData.redis.keyCount.toLocaleString()}
                </span>
              </div>
            )}

            {healthData.redis.memoryUsage && (
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="text-sm font-medium text-gray-900">
                    {healthData.redis.memoryUsage.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${healthData.redis.memoryUsage.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {formatBytes(healthData.redis.memoryUsage.used)} /{' '}
                  {formatBytes(healthData.redis.memoryUsage.max)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SSL Status Summary */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <div className="rounded-lg bg-blue-100 p-2">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">SSL Certificates</h3>
              <p className="text-sm text-gray-600">{healthData.ssl.length} domains monitored</p>
            </div>
          </div>

          <div className="space-y-2">
            {healthData.ssl.slice(0, 3).map((ssl, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0"
              >
                <div className="flex items-center">
                  {getStatusIcon(ssl.status)}
                  <span className="ml-2 max-w-[150px] truncate text-sm text-gray-900">
                    {ssl.domain}
                  </span>
                </div>
                <div className="text-right">
                  <div className={cn('rounded-full px-2 py-1 text-xs', getStatusColor(ssl.status))}>
                    {ssl.status}
                  </div>
                  {ssl.daysUntilExpiry && (
                    <div className="mt-1 text-xs text-gray-500">{ssl.daysUntilExpiry}d left</div>
                  )}
                </div>
              </div>
            ))}

            {healthData.ssl.length > 3 && (
              <div className="pt-2 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View all {healthData.ssl.length} certificates →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Health Checks */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Health Checks</h3>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {healthData.overall.checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={cn('mr-3 rounded-full p-1.5', getStatusColor(check.status))}>
                    {getStatusIcon(check.status)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{check.name}</h4>
                    <p className="text-sm text-gray-600">{check.message}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-900">{check.duration}ms</div>
                  <div className="text-xs text-gray-500">
                    {new Date(check.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;
