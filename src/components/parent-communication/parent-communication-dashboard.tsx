/**
 * Parent Communication Dashboard Widget
 * Sprint 6: Parent Communication Portal Development
 * İ-EP.APP - Veli İletişim Dashboard Widget
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MessageSquare,
  Calendar,
  Bell,
  Star,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Eye,
  Plus,
  BarChart3,
  Target,
  Activity,
  Award,
  Heart,
  Phone,
  Video,
  MapPin,
  Mail,
  MessageCircle,
  FileText,
  Settings,
  Download,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Info,
  Zap,
  Shield,
  Lightbulb,
  Flag,
  Volume2,
  UserCheck,
  BookOpen,
  Home,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export function ParentCommunicationDashboard() {
  // Mock data - gerçek uygulamada API'den gelecek
  const communicationStats = {
    totalParents: 120,
    activeConversations: 45,
    unreadMessages: 28,
    pendingMeetings: 12,
    newNotifications: 8,
    feedbackCount: 34,
    responseRate: 94.5,
    averageResponseTime: 2.4,
    satisfactionRating: 4.6,
    monthlyTrend: 'up',
    trendValue: 8.2,
  };

  const recentActivity = [
    {
      id: '1',
      type: 'message',
      title: 'Ayşe Veli mesaj gönderdi',
      description: "Ali'nin matematik performansı hakkında",
      timestamp: '2025-01-15T10:30:00',
      status: 'unread',
      priority: 'medium',
      parentName: 'Ayşe Veli',
      studentName: 'Ali Veli',
    },
    {
      id: '2',
      type: 'meeting',
      title: 'Veli toplantısı onaylandı',
      description: 'Mehmet Kaya ile yarın 15:00',
      timestamp: '2025-01-15T09:15:00',
      status: 'confirmed',
      priority: 'high',
      parentName: 'Mehmet Kaya',
      studentName: 'Fatma Kaya',
    },
    {
      id: '3',
      type: 'notification',
      title: 'Bildirim gönderildi',
      description: 'Sınav sonuçları 30 veliye bildirildi',
      timestamp: '2025-01-15T08:45:00',
      status: 'sent',
      priority: 'info',
      count: 30,
    },
    {
      id: '4',
      type: 'feedback',
      title: 'Geri bildirim alındı',
      description: 'Hasan Yılmaz 5 yıldız verdi',
      timestamp: '2025-01-15T08:00:00',
      status: 'received',
      priority: 'positive',
      parentName: 'Hasan Yılmaz',
      rating: 5,
    },
  ];

  const upcomingMeetings = [
    {
      id: '1',
      parent: 'Ayşe Veli',
      student: 'Ali Veli',
      teacher: 'Ahmet Öğretmen',
      subject: 'Matematik',
      date: '2025-01-18T14:00:00',
      duration: 30,
      type: 'individual',
      mode: 'in_person',
      status: 'confirmed',
    },
    {
      id: '2',
      parent: 'Mehmet Kaya',
      student: 'Fatma Kaya',
      teacher: 'Zeynep Öğretmen',
      subject: 'Türkçe',
      date: '2025-01-19T15:30:00',
      duration: 45,
      type: 'individual',
      mode: 'online',
      status: 'pending',
    },
    {
      id: '3',
      parent: 'Fatma Demir',
      student: 'Ahmet Demir',
      teacher: 'Mustafa Öğretmen',
      subject: 'Fen Bilgisi',
      date: '2025-01-20T16:00:00',
      duration: 30,
      type: 'urgent',
      mode: 'in_person',
      status: 'confirmed',
    },
  ];

  const topParents = [
    {
      name: 'Ayşe Veli',
      student: 'Ali Veli',
      totalMessages: 24,
      totalMeetings: 5,
      responseRate: 100,
      engagementScore: 95,
      trend: 'up',
    },
    {
      name: 'Mehmet Kaya',
      student: 'Fatma Kaya',
      totalMessages: 18,
      totalMeetings: 3,
      responseRate: 89,
      engagementScore: 87,
      trend: 'stable',
    },
    {
      name: 'Fatma Demir',
      student: 'Ahmet Demir',
      totalMessages: 12,
      totalMeetings: 2,
      responseRate: 92,
      engagementScore: 82,
      trend: 'up',
    },
  ];

  const communicationChannels = [
    {
      channel: 'Uygulama Mesajları',
      icon: MessageSquare,
      usage: 78,
      preference: 85,
      responseTime: 1.2,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      channel: 'E-posta',
      icon: Mail,
      usage: 65,
      preference: 72,
      responseTime: 4.5,
      color: 'bg-green-100 text-green-800',
    },
    {
      channel: 'SMS',
      icon: Phone,
      usage: 42,
      preference: 58,
      responseTime: 0.8,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      channel: 'Telefon',
      icon: Phone,
      usage: 25,
      preference: 45,
      responseTime: 0.1,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  const pendingActions = [
    {
      id: '1',
      type: 'message',
      title: 'Okunmamış mesajlar',
      count: 28,
      priority: 'high',
      action: 'Yanıtla',
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: '2',
      type: 'meeting',
      title: 'Onay bekleyen toplantılar',
      count: 12,
      priority: 'medium',
      action: 'Onayla',
      icon: Calendar,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: '3',
      type: 'notification',
      title: 'Bekleyen bildirimler',
      count: 8,
      priority: 'low',
      action: 'Gönder',
      icon: Bell,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: '4',
      type: 'feedback',
      title: 'Yanıt bekleyen geri bildirimler',
      count: 5,
      priority: 'medium',
      action: 'Yanıtla',
      icon: Star,
      color: 'bg-green-100 text-green-800',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'feedback':
        return <Star className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string, status: string) => {
    if (type === 'message') {
      return status === 'unread' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
    }
    if (type === 'meeting') {
      return status === 'confirmed'
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800';
    }
    if (type === 'notification') {
      return 'bg-purple-100 text-purple-800';
    }
    if (type === 'feedback') {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingModeIcon = (mode: string) => {
    switch (mode) {
      case 'online':
        return <Video className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'positive':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Veli İletişim Sistemi</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/parent-communication">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Detaylı Görünüm
            </Button>
          </Link>
          <Link href="/dashboard/parent-communication?tab=messages">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Mesaj
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Veli</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationStats.totalParents}</div>
            <p className="text-muted-foreground text-xs">
              {communicationStats.activeConversations} aktif konuşma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Okunmamış Mesaj</CardTitle>
            <MessageSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {communicationStats.unreadMessages}
            </div>
            <p className="text-muted-foreground text-xs">Yanıt bekleyen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yanıt Oranı</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              %{communicationStats.responseRate}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />+{communicationStats.trendValue}% bu ay
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memnuniyet</CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {communicationStats.satisfactionRating}/5
            </div>
            <p className="text-muted-foreground text-xs">Ortalama puan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Son Aktiviteler
            </CardTitle>
            <CardDescription>Son iletişim aktiviteleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    <Badge
                      variant="outline"
                      className={getActivityColor(activity.type, activity.status)}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <Badge variant="outline" className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-gray-600">{activity.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(activity.timestamp).toLocaleString('tr-TR')}</span>
                      {activity.parentName && (
                        <>
                          <span>•</span>
                          <span>{activity.parentName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Yaklaşan Toplantılar
            </CardTitle>
            <CardDescription>Planlanan veli toplantıları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">{meeting.parent}</p>
                        <p className="text-xs text-gray-600">{meeting.student}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getMeetingStatusColor(meeting.status)}>
                      {meeting.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(meeting.date).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(meeting.date).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        {getMeetingModeIcon(meeting.mode)}
                        {meeting.mode === 'online'
                          ? 'Online'
                          : meeting.mode === 'in_person'
                            ? 'Yüz yüze'
                            : 'Telefon'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <BookOpen className="h-3 w-3" />
                      <span>
                        {meeting.teacher} - {meeting.subject}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Bekleyen İşlemler
            </CardTitle>
            <CardDescription>Dikkat gerektiren işlemler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-gray-600">{action.count} öğe</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {action.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Engaged Parents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              En Aktif Veliler
            </CardTitle>
            <CardDescription>En çok etkileşim kuran veliler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topParents.map((parent, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{parent.name}</p>
                      <p className="text-xs text-gray-600">{parent.student}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">{parent.totalMessages}</div>
                      <div className="text-xs text-gray-600">Mesaj</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{parent.totalMeetings}</div>
                      <div className="text-xs text-gray-600">Toplantı</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-sm font-medium ${getEngagementColor(parent.engagementScore)}`}
                      >
                        {parent.engagementScore}
                      </div>
                      <div className="text-xs text-gray-600">Katılım</div>
                    </div>
                    <div className="flex items-center gap-1">{getTrendIcon(parent.trend)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            İletişim Kanalları
          </CardTitle>
          <CardDescription>Kanal kullanımı ve performans metrikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {communicationChannels.map((channel, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <channel.icon className="h-5 w-5" />
                  <h3 className="font-medium">{channel.channel}</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Kullanım</span>
                      <span className="text-sm font-medium">{channel.usage}%</span>
                    </div>
                    <Progress value={channel.usage} className="h-2" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tercih</span>
                      <span className="text-sm font-medium">{channel.preference}%</span>
                    </div>
                    <Progress value={channel.preference} className="h-2" />
                  </div>
                  <div className="text-xs text-gray-600">Avg. yanıt: {channel.responseTime}h</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>Sık kullanılan iletişim işlemleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/parent-communication?tab=messages">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Mesajlar
              </Button>
            </Link>

            <Link href="/dashboard/parent-communication?tab=meetings">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Toplantılar
              </Button>
            </Link>

            <Link href="/dashboard/parent-communication?tab=notifications">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Bildirimler
              </Button>
            </Link>

            <Link href="/dashboard/parent-communication?tab=feedback">
              <Button variant="outline" className="w-full justify-start">
                <Star className="mr-2 h-4 w-4" />
                Geri Bildirim
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
