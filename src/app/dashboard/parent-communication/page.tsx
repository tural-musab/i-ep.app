/**
 * Parent Communication Page
 * Sprint 6: Parent Communication Portal Development
 * İ-EP.APP - Veli İletişim Sayfası
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  Calendar, 
  Bell, 
  Star, 
  Users, 
  Clock,
  Send,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Archive,
  Reply,
  Forward,
  Phone,
  Video,
  Mail,
  UserCheck,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  FileText,
  Settings,
  Download
} from 'lucide-react';
import { ParentMessagingSystem } from '@/components/parent-communication/parent-messaging-system';
import { ParentMeetingScheduler } from '@/components/parent-communication/parent-meeting-scheduler';
import { ParentNotificationCenter } from '@/components/parent-communication/parent-notification-center';
import { ParentFeedbackSystem } from '@/components/parent-communication/parent-feedback-system';

export default function ParentCommunicationPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - gerçek uygulamada API'den gelecek
  const communicationOverview = {
    totalParents: 120,
    activeConversations: 45,
    pendingMeetings: 12,
    unreadMessages: 28,
    responseRate: 94.5,
    averageResponseTime: 2.4,
    satisfactionRating: 4.6,
    monthlyTrend: 'up',
    trendValue: 8.2
  };

  const recentMessages = [
    {
      id: '1',
      parent: {
        name: 'Ayşe Veli',
        avatar: '/api/placeholder/40/40',
        phone: '+90 555 123 4567',
        email: 'ayse.veli@parent.com'
      },
      student: {
        name: 'Ali Veli',
        class: '5-A',
        number: '2025001'
      },
      teacher: 'Ahmet Öğretmen',
      subject: 'Matematik performansı hakkında',
      preview: 'Merhaba, Ali\'nin matematik dersindeki son durumu hakkında bilgi alabilir miyim?',
      timestamp: '2025-01-15T10:30:00',
      status: 'unread',
      priority: 'medium',
      type: 'inquiry'
    },
    {
      id: '2',
      parent: {
        name: 'Mehmet Kaya',
        avatar: '/api/placeholder/40/40',
        phone: '+90 555 234 5678',
        email: 'mehmet.kaya@parent.com'
      },
      student: {
        name: 'Fatma Kaya',
        class: '6-B',
        number: '2025002'
      },
      teacher: 'Zeynep Öğretmen',
      subject: 'Veli toplantısı randevusu',
      preview: 'Bu hafta müsait olduğunuz bir randevu saati var mı?',
      timestamp: '2025-01-15T09:15:00',
      status: 'read',
      priority: 'high',
      type: 'meeting_request'
    },
    {
      id: '3',
      parent: {
        name: 'Fatma Demir',
        avatar: '/api/placeholder/40/40',
        phone: '+90 555 345 6789',
        email: 'fatma.demir@parent.com'
      },
      student: {
        name: 'Ahmet Demir',
        class: '5-A',
        number: '2025003'
      },
      teacher: 'Mustafa Öğretmen',
      subject: 'Teşekkür mesajı',
      preview: 'Ahmet\'e gösterdiğiniz ilgi için çok teşekkür ederim.',
      timestamp: '2025-01-15T08:45:00',
      status: 'replied',
      priority: 'low',
      type: 'compliment'
    }
  ];

  const upcomingMeetings = [
    {
      id: '1',
      parent: {
        name: 'Ayşe Veli',
        avatar: '/api/placeholder/40/40'
      },
      student: {
        name: 'Ali Veli',
        class: '5-A'
      },
      teacher: 'Ahmet Öğretmen',
      subject: 'Matematik',
      title: 'Dönem sonu değerlendirmesi',
      date: '2025-01-18T14:00:00',
      duration: 30,
      type: 'individual',
      mode: 'in_person',
      status: 'confirmed',
      location: 'Öğretmenler Odası'
    },
    {
      id: '2',
      parent: {
        name: 'Mehmet Kaya',
        avatar: '/api/placeholder/40/40'
      },
      student: {
        name: 'Fatma Kaya',
        class: '6-B'
      },
      teacher: 'Zeynep Öğretmen',
      subject: 'Türkçe',
      title: 'Okuma gelişimi görüşmesi',
      date: '2025-01-19T15:30:00',
      duration: 45,
      type: 'individual',
      mode: 'online',
      status: 'pending',
      meetingLink: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '3',
      parent: {
        name: 'Fatma Demir',
        avatar: '/api/placeholder/40/40'
      },
      student: {
        name: 'Ahmet Demir',
        class: '5-A'
      },
      teacher: 'Mustafa Öğretmen',
      subject: 'Fen Bilgisi',
      title: 'Proje çalışması toplantısı',
      date: '2025-01-20T16:00:00',
      duration: 30,
      type: 'group',
      mode: 'in_person',
      status: 'confirmed',
      location: 'Fen Laboruvarı'
    }
  ];

  const parentEngagementStats = [
    {
      parent: 'Ayşe Veli',
      student: 'Ali Veli',
      class: '5-A',
      totalMessages: 24,
      totalMeetings: 5,
      lastActivity: '2025-01-15T10:30:00',
      responseRate: 100,
      engagementScore: 95,
      trend: 'up'
    },
    {
      parent: 'Mehmet Kaya',
      student: 'Fatma Kaya',
      class: '6-B',
      totalMessages: 18,
      totalMeetings: 3,
      lastActivity: '2025-01-15T09:15:00',
      responseRate: 89,
      engagementScore: 87,
      trend: 'stable'
    },
    {
      parent: 'Fatma Demir',
      student: 'Ahmet Demir',
      class: '5-A',
      totalMessages: 12,
      totalMeetings: 2,
      lastActivity: '2025-01-14T16:20:00',
      responseRate: 92,
      engagementScore: 82,
      trend: 'up'
    },
    {
      parent: 'Hasan Yılmaz',
      student: 'Zehra Yılmaz',
      class: '6-A',
      totalMessages: 8,
      totalMeetings: 1,
      lastActivity: '2025-01-13T14:45:00',
      responseRate: 75,
      engagementScore: 68,
      trend: 'down'
    }
  ];

  const communicationChannels = [
    {
      channel: 'Uygulama Mesajları',
      icon: MessageSquare,
      usage: 78,
      preference: 85,
      responseTime: 1.2,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      channel: 'E-posta',
      icon: Mail,
      usage: 65,
      preference: 72,
      responseTime: 4.5,
      color: 'bg-green-100 text-green-800'
    },
    {
      channel: 'SMS',
      icon: Phone,
      usage: 42,
      preference: 58,
      responseTime: 0.8,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      channel: 'Telefon',
      icon: Phone,
      usage: 25,
      preference: 45,
      responseTime: 0.1,
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const feedbackSummary = {
    totalFeedback: 156,
    averageRating: 4.6,
    categories: {
      teacher_performance: 45,
      communication: 38,
      curriculum: 28,
      facility: 22,
      administrative: 15,
      other: 8
    },
    recentFeedback: [
      {
        id: '1',
        parent: 'Ayşe Veli',
        rating: 5,
        category: 'teacher_performance',
        title: 'Mükemmel öğretmen',
        date: '2025-01-15',
        status: 'responded'
      },
      {
        id: '2',
        parent: 'Mehmet Kaya',
        rating: 4,
        category: 'communication',
        title: 'İletişim geliştirilebilir',
        date: '2025-01-14',
        status: 'reviewed'
      },
      {
        id: '3',
        parent: 'Fatma Demir',
        rating: 5,
        category: 'curriculum',
        title: 'Müfredat çok iyi',
        date: '2025-01-13',
        status: 'responded'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inquiry': return <MessageSquare className="h-4 w-4" />;
      case 'meeting_request': return <Calendar className="h-4 w-4" />;
      case 'compliment': return <Star className="h-4 w-4" />;
      case 'concern': return <AlertCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredMessages = recentMessages.filter(message => {
    const matchesSearch = message.parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || message.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veli İletişim Sistemi</h1>
          <p className="text-gray-600 mt-2">Veliler ile etkili iletişim kurun ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Ayarlar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Mesaj
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Veli</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationOverview.totalParents}</div>
            <p className="text-xs text-muted-foreground">
              {communicationOverview.activeConversations} aktif konuşma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Okunmamış Mesaj</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{communicationOverview.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Yanıt bekleyen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yanıt Oranı</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">%{communicationOverview.responseRate}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{communicationOverview.trendValue}% bu ay
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memnuniyet</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{communicationOverview.satisfactionRating}/5</div>
            <p className="text-xs text-muted-foreground">
              Ortalama puan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="messages">Mesajlar</TabsTrigger>
          <TabsTrigger value="meetings">Toplantılar</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="feedback">Geri Bildirim</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Son Mesajlar
                </CardTitle>
                <CardDescription>
                  En son gelen veli mesajları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages.slice(0, 5).map((message) => (
                    <div key={message.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.parent.avatar} />
                        <AvatarFallback>
                          {message.parent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{message.parent.name}</p>
                          <Badge variant="outline" className={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(message.priority)}>
                            {message.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString('tr-TR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(message.type)}
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
                <CardDescription>
                  Planlanan veli toplantıları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={meeting.parent.avatar} />
                            <AvatarFallback>
                              {meeting.parent.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{meeting.parent.name}</p>
                            <p className="text-xs text-gray-600">{meeting.student.name} - {meeting.student.class}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getMeetingStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{meeting.title}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(meeting.date).toLocaleString('tr-TR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meeting.duration} dk
                          </div>
                          <div className="flex items-center gap-1">
                            {meeting.mode === 'online' ? <Video className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                            {meeting.mode === 'online' ? 'Online' : 'Yüz yüze'}
                          </div>
                        </div>
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
              <CardDescription>
                Kanal kullanımı ve tercihler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {communicationChannels.map((channel, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <channel.icon className="h-5 w-5" />
                      <h3 className="font-medium">{channel.channel}</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Kullanım</span>
                          <span className="text-sm font-medium">{channel.usage}%</span>
                        </div>
                        <Progress value={channel.usage} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Tercih</span>
                          <span className="text-sm font-medium">{channel.preference}%</span>
                        </div>
                        <Progress value={channel.preference} className="h-2" />
                      </div>
                      <div className="text-xs text-gray-600">
                        Avg. yanıt: {channel.responseTime}h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parent Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Veli Katılımı
              </CardTitle>
              <CardDescription>
                En aktif veliler ve katılım skorları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parentEngagementStats.map((parent, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{parent.parent}</p>
                        <p className="text-sm text-gray-600">{parent.student} - {parent.class}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-medium">{parent.totalMessages}</div>
                        <div className="text-xs text-gray-600">Mesaj</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{parent.totalMeetings}</div>
                        <div className="text-xs text-gray-600">Toplantı</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{parent.responseRate}%</div>
                        <div className="text-xs text-gray-600">Yanıt</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium ${getEngagementColor(parent.engagementScore)}`}>
                          {parent.engagementScore}
                        </div>
                        <div className="text-xs text-gray-600">Katılım</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(parent.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <ParentMessagingSystem />
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-6">
          <ParentMeetingScheduler />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <ParentNotificationCenter />
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <ParentFeedbackSystem />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>İletişim Analitikleri</CardTitle>
                <CardDescription>
                  Detaylı performans metrikleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{communicationOverview.averageResponseTime}h</div>
                      <div className="text-sm text-blue-800">Ortalama Yanıt Süresi</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{communicationOverview.activeConversations}</div>
                      <div className="text-sm text-green-800">Aktif Konuşma</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Kanal Performansı</h4>
                    {communicationChannels.map((channel, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <channel.icon className="h-4 w-4" />
                          <span className="text-sm">{channel.channel}</span>
                        </div>
                        <div className="text-sm font-medium">{channel.usage}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geri Bildirim Özeti</CardTitle>
                <CardDescription>
                  Veli memnuniyet durumu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{feedbackSummary.averageRating}/5</div>
                    <div className="text-sm text-yellow-800">Ortalama Puan</div>
                    <div className="text-xs text-gray-600">{feedbackSummary.totalFeedback} değerlendirme</div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Kategori Dağılımı</h4>
                    {Object.entries(feedbackSummary.categories).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}