/**
 * Demo Analytics Dashboard Component
 * Displays comprehensive demo usage metrics and insights
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  Users,
  Clock,
  TrendingUp,
  Globe,
  Activity,
  Target,
  Zap,
  AlertCircle,
  Download,
  RefreshCw,
} from 'lucide-react';

interface DemoAnalyticsData {
  overview: {
    totalSessions: number;
    totalEvents: number;
    averageSessionDuration: number;
    completionRate: number;
    conversionRate: number;
    totalConversions: number;
  };
  roleDistribution: Array<{
    role: string;
    sessions: number;
    averageDuration: number;
    completionRate: number;
  }>;
  geographic: Array<{
    country: string;
    sessions: number;
  }>;
  features: Array<{
    feature: string;
    role: string;
    interactions: number;
  }>;
  timeSeries: Array<{
    date: string;
    sessions: number;
    conversions: number;
  }>;
  conversion: Array<{
    step: string;
    count: number;
    conversionRate: number;
  }>;
  performance: {
    averageLoadTime: number;
    averageDOMContentLoaded: number;
    averageFirstContentfulPaint: number;
    averageTimeToInteractive: number;
  };
  realtime: {
    activeSessions: number;
    recentEvents: number;
    activeRoles: string[];
  };
  metadata: {
    period: string;
    startDate: string;
    endDate: string;
    timezone: string;
    generatedAt: string;
  };
}

export default function DemoAnalyticsDashboard() {
  const [data, setData] = useState<DemoAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('7d');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Color scheme for charts
  const colors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    teal: '#14b8a6',
  };

  const roleColors: Record<string, string> = {
    admin: colors.primary,
    teacher: colors.secondary,
    student: colors.warning,
    parent: colors.purple,
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/demo-dashboard?period=${period}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const analyticsData = await response.json();
      setData(analyticsData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load and periodic refresh
  useEffect(() => {
    fetchAnalyticsData();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [period]);

  // Export data as JSON
  const handleExport = () => {
    if (!data) return;

    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      exportedBy: 'demo-analytics-dashboard',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `demo-analytics-${period}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading demo analytics...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatRoleName = (role: string): string => {
    const roleNames: Record<string, string> = {
      admin: 'Yönetici',
      teacher: 'Öğretmen',
      student: 'Öğrenci',
      parent: 'Veli',
    };
    return roleNames[role] || role;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demo Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Demo kullanım metrikleri ve dönüşüm analizi
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Saat</SelectItem>
              <SelectItem value="7d">7 Gün</SelectItem>
              <SelectItem value="30d">30 Gün</SelectItem>
              <SelectItem value="90d">90 Gün</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={fetchAnalyticsData} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Oturumlar</p>
                <p className="text-2xl font-bold">{data.realtime.activeSessions}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Son Saat Etkinlik</p>
                <p className="text-2xl font-bold">{data.realtime.recentEvents}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Roller</p>
                <div className="flex space-x-1 mt-1">
                  {data.realtime.activeRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {formatRoleName(role)}
                    </Badge>
                  ))}
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Son Güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}</p>
              <p>Dönem: {data.metadata.period}</p>
              <p>Saat Dilimi: {data.metadata.timezone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Oturum</p>
                <p className="text-3xl font-bold">{data.overview.totalSessions.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ort. Süre</p>
                <p className="text-3xl font-bold">{formatDuration(data.overview.averageSessionDuration * 1000)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tamamlama Oranı</p>
                <p className="text-3xl font-bold">{data.overview.completionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dönüşüm Oranı</p>
                <p className="text-3xl font-bold">{data.overview.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="roles">Roller</TabsTrigger>
          <TabsTrigger value="geography">Coğrafya</TabsTrigger>
          <TabsTrigger value="features">Özellikler</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Oturum ve Dönüşüm Trendi</CardTitle>
              <CardDescription>
                Zaman içindeki demo kullanımı ve dönüşüm oranları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="sessions"
                      stackId="1"
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.3}
                      name="Oturumlar"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversions"
                      stroke={colors.secondary}
                      strokeWidth={2}
                      name="Dönüşümler"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Dönüşüm Hunisi</CardTitle>
              <CardDescription>
                Demo kullanıcılarının adım adım yolculuğu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.conversion} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="step" type="category" />
                    <Tooltip />
                    <Bar dataKey="count" fill={colors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          {/* Role Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rol Dağılımı</CardTitle>
                <CardDescription>
                  Demo kullanımının rollere göre dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.roleDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ role, sessions }) => `${formatRoleName(role)}: ${sessions}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sessions"
                      >
                        {data.roleDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={roleColors[entry.role] || colors.primary}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rol Performansı</CardTitle>
                <CardDescription>
                  Rollere göre ortalama süre ve tamamlama oranları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.roleDistribution.map((role) => (
                    <div key={role.role} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-semibold">{formatRoleName(role.role)}</p>
                        <p className="text-sm text-muted-foreground">
                          {role.sessions} oturum
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDuration(role.averageDuration * 1000)}</p>
                        <p className="text-sm text-green-600">{role.completionRate}% tamamlama</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Coğrafi Dağılım</CardTitle>
              <CardDescription>
                Demo kullanımının ülkelere göre dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.geographic}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill={colors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {/* Popular Features */}
          <Card>
            <CardHeader>
              <CardTitle>Popüler Özellikler</CardTitle>
              <CardDescription>
                En çok kullanılan demo özellikleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.features.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="interactions" fill={colors.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Sayfa Yükleme</p>
                  <p className="text-2xl font-bold">{data.performance.averageLoadTime}ms</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">DOM Hazır</p>
                  <p className="text-2xl font-bold">{data.performance.averageDOMContentLoaded}ms</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">İlk İçerik</p>
                  <p className="text-2xl font-bold">{data.performance.averageFirstContentfulPaint}ms</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Etkileşim Hazır</p>
                  <p className="text-2xl font-bold">{data.performance.averageTimeToInteractive}ms</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}