'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { AdminGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database,
  Activity,
  Users,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Server,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import Link from 'next/link';

// System health data types
interface SystemStatus {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  lastCheck: string;
  responseTime?: number;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
  };
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  endpoint?: string;
}

interface SystemHealthData {
  overall: SystemStatus;
  database: SystemStatus;
  storage: SystemStatus;
  authentication: SystemStatus;
  apis: SystemStatus;
  metrics: SystemMetrics;
  services: ServiceStatus[];
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
}

// Demo system health data
const DEMO_HEALTH_DATA: SystemHealthData = {
  overall: {
    status: 'healthy',
    message: 'Tüm sistemler normal çalışıyor',
    lastCheck: new Date().toISOString(),
  },
  database: {
    status: 'healthy',
    message: 'PostgreSQL bağlantısı aktif',
    lastCheck: new Date().toISOString(),
    responseTime: 12
  },
  storage: {
    status: 'healthy',
    message: 'Supabase Storage çalışıyor',
    lastCheck: new Date().toISOString(),
    responseTime: 45
  },
  authentication: {
    status: 'healthy',
    message: 'NextAuth.js servisleri aktif',
    lastCheck: new Date().toISOString(),
    responseTime: 28
  },
  apis: {
    status: 'warning',
    message: '14/14 API endpoint aktif',
    lastCheck: new Date().toISOString(),
    responseTime: 156
  },
  metrics: {
    cpu: {
      usage: 23.8,
      temperature: 45,
      cores: 4
    },
    memory: {
      total: 8192,
      used: 3456,
      available: 4736,
      percentage: 42.2
    },
    disk: {
      total: 256000,
      used: 89500,
      available: 166500,
      percentage: 34.9
    },
    network: {
      inbound: 2.4,
      outbound: 1.8,
      latency: 34
    }
  },
  services: [
    {
      id: '1',
      name: 'API Gateway',
      status: 'online',
      responseTime: 45,
      uptime: 99.8,
      lastCheck: new Date().toISOString(),
      endpoint: '/api/health'
    },
    {
      id: '2',
      name: 'Database Connection',
      status: 'online',
      responseTime: 12,
      uptime: 99.9,
      lastCheck: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Authentication',
      status: 'online',
      responseTime: 28,
      uptime: 99.7,
      lastCheck: new Date().toISOString(),
      endpoint: '/api/auth/session'
    },
    {
      id: '4',
      name: 'File Storage',
      status: 'online',
      responseTime: 89,
      uptime: 99.5,
      lastCheck: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Email Service',
      status: 'degraded',
      responseTime: 234,
      uptime: 98.2,
      lastCheck: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'Redis Cache',
      status: 'online',
      responseTime: 8,
      uptime: 99.9,
      lastCheck: new Date().toISOString(),
    }
  ],
  activeUsers: 24,
  totalRequests: 8947,
  errorRate: 0.12,
  avgResponseTime: 145
};

function SystemHealthContent() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load system health data
  useEffect(() => {
    async function loadHealthData() {
      setIsLoading(true);
      try {
        // TODO: Replace with real API call
        // const response = await fetch('/api/admin/system-health');
        // const result = await response.json();
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        setHealthData(DEMO_HEALTH_DATA);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading health data:', error);
        setHealthData(DEMO_HEALTH_DATA);
      } finally {
        setIsLoading(false);
      }
    }

    loadHealthData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setHealthData(DEMO_HEALTH_DATA);
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 500);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <Badge variant="outline" className="border-green-500 text-green-600">Sağlıklı</Badge>;
      case 'warning':
      case 'degraded':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Uyarı</Badge>;
      case 'critical':
      case 'offline':
        return <Badge variant="outline" className="border-red-500 text-red-600">Kritik</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format uptime
  const formatUptime = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  if (isLoading && !healthData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Sistem durumu yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <p className="text-gray-500">Sistem durumu yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Admin Paneli'ne Dön
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistem Sağlığı</h1>
            <p className="mt-2 text-gray-600">
              Gerçek zamanlı sistem durumu ve performans metrikleri
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(healthData.overall.status)}
                <div>
                  <CardTitle>Genel Sistem Durumu</CardTitle>
                  <CardDescription>{healthData.overall.message}</CardDescription>
                </div>
              </div>
              {getStatusBadge(healthData.overall.status)}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{healthData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Şu anda online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İstek</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthData.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Bugün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hata Oranı</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">%{healthData.errorRate.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Son 24 saat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Yanıt</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{healthData.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">API yanıt süresi</p>
          </CardContent>
        </Card>
      </div>

      {/* Core Services Status */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5" />
              Ana Servis Durumu
            </CardTitle>
            <CardDescription>Kritik sistem bileşenleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(healthData.database.status)}
                  <div>
                    <div className="font-medium">Database (PostgreSQL)</div>
                    <div className="text-sm text-gray-500">{healthData.database.message}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{healthData.database.responseTime}ms</div>
                  {getStatusBadge(healthData.database.status)}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(healthData.storage.status)}
                  <div>
                    <div className="font-medium">File Storage</div>
                    <div className="text-sm text-gray-500">{healthData.storage.message}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{healthData.storage.responseTime}ms</div>
                  {getStatusBadge(healthData.storage.status)}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(healthData.authentication.status)}
                  <div>
                    <div className="font-medium">Authentication</div>
                    <div className="text-sm text-gray-500">{healthData.authentication.message}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{healthData.authentication.responseTime}ms</div>
                  {getStatusBadge(healthData.authentication.status)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(healthData.apis.status)}
                  <div>
                    <div className="font-medium">API Endpoints</div>
                    <div className="text-sm text-gray-500">{healthData.apis.message}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{healthData.apis.responseTime}ms</div>
                  {getStatusBadge(healthData.apis.status)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Performans Metrikleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Cpu className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">CPU Kullanımı</span>
                </div>
                <span className="text-sm text-gray-600">%{healthData.metrics.cpu.usage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${healthData.metrics.cpu.usage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {healthData.metrics.cpu.cores} çekirdek, {healthData.metrics.cpu.temperature}°C
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <MemoryStick className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Bellek Kullanımı</span>
                </div>
                <span className="text-sm text-gray-600">%{healthData.metrics.memory.percentage.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${healthData.metrics.memory.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatBytes(healthData.metrics.memory.used * 1024 * 1024)} / {formatBytes(healthData.metrics.memory.total * 1024 * 1024)}
              </div>
            </div>

            {/* Disk Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <HardDrive className="mr-2 h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Disk Kullanımı</span>
                </div>
                <span className="text-sm text-gray-600">%{healthData.metrics.disk.percentage.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${healthData.metrics.disk.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatBytes(healthData.metrics.disk.used * 1024 * 1024)} / {formatBytes(healthData.metrics.disk.total * 1024 * 1024)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Servis Durumu
            </CardTitle>
            <CardDescription>Tüm mikroservisler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthData.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="font-medium text-sm">{service.name}</div>
                      <div className="text-xs text-gray-500">
                        Uptime: {formatUptime(service.uptime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">{service.responseTime}ms</div>
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="mr-2 h-5 w-5" />
            Network İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {healthData.metrics.network.inbound.toFixed(1)} MB/s
              </div>
              <div className="text-sm text-gray-500">Gelen Trafik</div>
              <TrendingUp className="mx-auto mt-2 h-4 w-4 text-green-500" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {healthData.metrics.network.outbound.toFixed(1)} MB/s
              </div>
              <div className="text-sm text-gray-500">Giden Trafik</div>
              <TrendingDown className="mx-auto mt-2 h-4 w-4 text-blue-500" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {healthData.metrics.network.latency}ms
              </div>
              <div className="text-sm text-gray-500">Ortalama Gecikme</div>
              <Clock className="mx-auto mt-2 h-4 w-4 text-gray-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SystemHealthPage() {
  return (
    <AdminGuard
      fallback={
        <AccessDenied
          title="Yönetici Girişi Gerekli"
          message="Bu sayfayı görüntülemek için yönetici hesabı ile giriş yapmalısınız."
        />
      }
      redirectTo="/auth/giris"
    >
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
        <SystemHealthContent />
      </Suspense>
    </AdminGuard>
  );
}