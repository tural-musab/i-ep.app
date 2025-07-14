/**
 * Parent Notification Center Component
 * Sprint 6: Parent Communication Portal Development
 * İ-EP.APP - Veli Bildirim Merkezi
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Send, 
  Users, 
  Clock, 
  Check,
  X,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Archive,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  Smartphone,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Calendar,
  BookOpen,
  GraduationCap,
  UserCheck,
  Activity,
  Shield,
  Target,
  Zap,
  Volume2,
  VolumeX,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Pause,
  Play,
  StopCircle
} from 'lucide-react';

interface ParentNotification {
  id: string;
  parent: {
    id: string;
    name: string;
    avatar: string;
    email: string;
    phone: string;
  };
  student?: {
    id: string;
    name: string;
    class: string;
    number: string;
  };
  teacher?: {
    id: string;
    name: string;
    subject: string;
  };
  notification: {
    type: 'academic' | 'behavioral' | 'attendance' | 'administrative' | 'event' | 'emergency';
    title: string;
    message: string;
    priority: 'info' | 'warning' | 'urgent' | 'critical';
    channel: 'app' | 'email' | 'sms' | 'push' | 'all';
    actionRequired: boolean;
    actionUrl?: string;
    expiresAt?: string;
    metadata?: Record<string, any>;
  };
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  readAt?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: ParentNotification['notification']['type'];
  title: string;
  message: string;
  priority: ParentNotification['notification']['priority'];
  channel: ParentNotification['notification']['channel'];
  actionRequired: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

interface NotificationSchedule {
  id: string;
  name: string;
  template: NotificationTemplate;
  targetParents: string[];
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'cancelled';
  createdAt: string;
}

export function ParentNotificationCenter() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  // Mock data - gerçek uygulamada API'den gelecek
  const [notifications] = useState<ParentNotification[]>([
    {
      id: '1',
      parent: {
        id: '1',
        name: 'Ayşe Veli',
        avatar: '/api/placeholder/40/40',
        email: 'ayse.veli@parent.com',
        phone: '+90 555 123 4567'
      },
      student: {
        id: '1',
        name: 'Ali Veli',
        class: '5-A',
        number: '2025001'
      },
      teacher: {
        id: '1',
        name: 'Ahmet Öğretmen',
        subject: 'Matematik'
      },
      notification: {
        type: 'academic',
        title: 'Matematik Sınav Sonucu',
        message: 'Ali\'nin matematik sınavı sonucu açıklandı. Sınav notu: 85/100. Detaylar için uygulamayı kontrol edin.',
        priority: 'info',
        channel: 'all',
        actionRequired: true,
        actionUrl: '/dashboard/grades?student=1',
        metadata: {
          subject: 'Matematik',
          grade: 85,
          examType: 'Dönemlik Sınav'
        }
      },
      status: 'delivered',
      createdAt: '2025-01-15T10:30:00',
      updatedAt: '2025-01-15T10:32:00',
      sentAt: '2025-01-15T10:32:00'
    },
    {
      id: '2',
      parent: {
        id: '2',
        name: 'Mehmet Kaya',
        avatar: '/api/placeholder/40/40',
        email: 'mehmet.kaya@parent.com',
        phone: '+90 555 234 5678'
      },
      student: {
        id: '2',
        name: 'Fatma Kaya',
        class: '6-B',
        number: '2025002'
      },
      teacher: {
        id: '2',
        name: 'Zeynep Öğretmen',
        subject: 'Türkçe'
      },
      notification: {
        type: 'behavioral',
        title: 'Olumlu Davranış Bildirimi',
        message: 'Fatma bugün sınıfta çok başarılı bir sunum yaptı ve arkadaşlarına yardım etti. Tebrik ediyoruz!',
        priority: 'info',
        channel: 'app',
        actionRequired: false,
        metadata: {
          behaviorType: 'positive',
          category: 'academic_participation'
        }
      },
      status: 'read',
      createdAt: '2025-01-15T09:15:00',
      updatedAt: '2025-01-15T09:20:00',
      sentAt: '2025-01-15T09:16:00',
      readAt: '2025-01-15T09:20:00'
    },
    {
      id: '3',
      parent: {
        id: '3',
        name: 'Fatma Demir',
        avatar: '/api/placeholder/40/40',
        email: 'fatma.demir@parent.com',
        phone: '+90 555 345 6789'
      },
      student: {
        id: '3',
        name: 'Ahmet Demir',
        class: '5-A',
        number: '2025003'
      },
      notification: {
        type: 'attendance',
        title: 'Devamsızlık Uyarısı',
        message: 'Ahmet bugün okula gelmedi. Devamsızlık durumu hakkında bilgi almak için okul ile iletişime geçin.',
        priority: 'warning',
        channel: 'all',
        actionRequired: true,
        actionUrl: '/dashboard/attendance?student=3',
        metadata: {
          absenceType: 'unexcused',
          date: '2025-01-15',
          totalAbsences: 3
        }
      },
      status: 'sent',
      createdAt: '2025-01-15T08:45:00',
      updatedAt: '2025-01-15T08:47:00',
      sentAt: '2025-01-15T08:47:00'
    },
    {
      id: '4',
      parent: {
        id: '4',
        name: 'Hasan Yılmaz',
        avatar: '/api/placeholder/40/40',
        email: 'hasan.yilmaz@parent.com',
        phone: '+90 555 456 7890'
      },
      student: {
        id: '4',
        name: 'Zehra Yılmaz',
        class: '6-A',
        number: '2025004'
      },
      notification: {
        type: 'event',
        title: 'Veliler Toplantısı',
        message: 'Yarın saat 19:00\'da veliler toplantısı yapılacaktır. Lütfen katılımınızı sağlayın.',
        priority: 'urgent',
        channel: 'all',
        actionRequired: true,
        actionUrl: '/dashboard/events?event=parent-meeting',
        expiresAt: '2025-01-16T19:00:00',
        metadata: {
          eventType: 'parent_meeting',
          date: '2025-01-16T19:00:00',
          location: 'Okul Konferans Salonu'
        }
      },
      status: 'delivered',
      createdAt: '2025-01-14T16:00:00',
      updatedAt: '2025-01-14T16:02:00',
      sentAt: '2025-01-14T16:02:00'
    },
    {
      id: '5',
      parent: {
        id: '5',
        name: 'Elif Özkan',
        avatar: '/api/placeholder/40/40',
        email: 'elif.ozkan@parent.com',
        phone: '+90 555 567 8901'
      },
      notification: {
        type: 'administrative',
        title: 'Sistem Bakımı',
        message: 'Bu gece 02:00-04:00 saatleri arasında sistem bakımı yapılacaktır. Bu sürede uygulamaya erişim sağlanamayacaktır.',
        priority: 'info',
        channel: 'app',
        actionRequired: false,
        metadata: {
          maintenanceStart: '2025-01-16T02:00:00',
          maintenanceEnd: '2025-01-16T04:00:00'
        }
      },
      status: 'scheduled',
      scheduledFor: '2025-01-15T20:00:00',
      createdAt: '2025-01-15T14:00:00',
      updatedAt: '2025-01-15T14:00:00'
    },
    {
      id: '6',
      parent: {
        id: '1',
        name: 'Ayşe Veli',
        avatar: '/api/placeholder/40/40',
        email: 'ayse.veli@parent.com',
        phone: '+90 555 123 4567'
      },
      student: {
        id: '1',
        name: 'Ali Veli',
        class: '5-A',
        number: '2025001'
      },
      notification: {
        type: 'emergency',
        title: 'ACİL: Okul Erken Kapanış',
        message: 'Hava koşulları nedeniyle okul bugün 14:00\'te kapanacaktır. Lütfen çocuğunuzu almaya gelin.',
        priority: 'critical',
        channel: 'all',
        actionRequired: true,
        metadata: {
          reason: 'weather_conditions',
          closingTime: '2025-01-15T14:00:00'
        }
      },
      status: 'sent',
      createdAt: '2025-01-15T13:30:00',
      updatedAt: '2025-01-15T13:32:00',
      sentAt: '2025-01-15T13:32:00'
    }
  ]);

  const [notificationTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Sınav Sonucu Bildirimi',
      type: 'academic',
      title: 'Sınav Sonucu Açıklandı',
      message: '{student_name} adlı öğrencinin {subject} sınavı sonucu açıklandı. Sınav notu: {grade}. Detaylar için uygulamayı kontrol edin.',
      priority: 'info',
      channel: 'all',
      actionRequired: true,
      isActive: true,
      usageCount: 145,
      createdAt: '2025-01-01T00:00:00'
    },
    {
      id: '2',
      name: 'Devamsızlık Uyarısı',
      type: 'attendance',
      title: 'Devamsızlık Bildirimi',
      message: '{student_name} bugün okula gelmedi. Devamsızlık durumu hakkında bilgi almak için okul ile iletişime geçin.',
      priority: 'warning',
      channel: 'all',
      actionRequired: true,
      isActive: true,
      usageCount: 89,
      createdAt: '2025-01-01T00:00:00'
    },
    {
      id: '3',
      name: 'Olumlu Davranış',
      type: 'behavioral',
      title: 'Olumlu Davranış Bildirimi',
      message: '{student_name} bugün {behavior_description}. Tebrik ediyoruz!',
      priority: 'info',
      channel: 'app',
      actionRequired: false,
      isActive: true,
      usageCount: 67,
      createdAt: '2025-01-01T00:00:00'
    },
    {
      id: '4',
      name: 'Etkinlik Duyurusu',
      type: 'event',
      title: 'Etkinlik Duyurusu',
      message: '{event_name} etkinliği {event_date} tarihinde yapılacaktır. Lütfen katılımınızı sağlayın.',
      priority: 'info',
      channel: 'all',
      actionRequired: true,
      isActive: true,
      usageCount: 23,
      createdAt: '2025-01-01T00:00:00'
    },
    {
      id: '5',
      name: 'Acil Durum',
      type: 'emergency',
      title: 'ACİL DURUM',
      message: 'ACİL: {emergency_message}',
      priority: 'critical',
      channel: 'all',
      actionRequired: true,
      isActive: true,
      usageCount: 5,
      createdAt: '2025-01-01T00:00:00'
    }
  ]);

  const [newNotificationData, setNewNotificationData] = useState({
    parents: [] as string[],
    students: [] as string[],
    type: 'academic',
    title: '',
    message: '',
    priority: 'info',
    channel: 'all',
    actionRequired: false,
    actionUrl: '',
    scheduledFor: '',
    expiresAt: ''
  });

  const [newTemplateData, setNewTemplateData] = useState({
    name: '',
    type: 'academic',
    title: '',
    message: '',
    priority: 'info',
    channel: 'all',
    actionRequired: false
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'behavioral': return <UserCheck className="h-4 w-4" />;
      case 'attendance': return <Calendar className="h-4 w-4" />;
      case 'administrative': return <Settings className="h-4 w-4" />;
      case 'event': return <Star className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'read': return <Eye className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'app': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      case 'all': return <Users className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    const matchesType = filterType === 'all' || notification.notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.notification.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const notificationStats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    delivered: notifications.filter(n => n.status === 'delivered').length,
    read: notifications.filter(n => n.status === 'read').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    scheduled: notifications.filter(n => n.status === 'scheduled').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    deliveryRate: (notifications.filter(n => n.status === 'delivered' || n.status === 'read').length / notifications.length) * 100,
    readRate: (notifications.filter(n => n.status === 'read').length / notifications.length) * 100
  };

  const channelStats = {
    app: notifications.filter(n => n.notification.channel === 'app').length,
    email: notifications.filter(n => n.notification.channel === 'email').length,
    sms: notifications.filter(n => n.notification.channel === 'sms').length,
    push: notifications.filter(n => n.notification.channel === 'push').length,
    all: notifications.filter(n => n.notification.channel === 'all').length
  };

  const typeStats = {
    academic: notifications.filter(n => n.notification.type === 'academic').length,
    behavioral: notifications.filter(n => n.notification.type === 'behavioral').length,
    attendance: notifications.filter(n => n.notification.type === 'attendance').length,
    administrative: notifications.filter(n => n.notification.type === 'administrative').length,
    event: notifications.filter(n => n.notification.type === 'event').length,
    emergency: notifications.filter(n => n.notification.type === 'emergency').length
  };

  const handleSendNotification = () => {
    console.log('Sending notification:', newNotificationData);
    // API call will be implemented here
    setIsCreatingNotification(false);
    setNewNotificationData({
      parents: [],
      students: [],
      type: 'academic',
      title: '',
      message: '',
      priority: 'info',
      channel: 'all',
      actionRequired: false,
      actionUrl: '',
      scheduledFor: '',
      expiresAt: ''
    });
  };

  const handleCreateTemplate = () => {
    console.log('Creating template:', newTemplateData);
    // API call will be implemented here
    setIsCreatingTemplate(false);
    setNewTemplateData({
      name: '',
      type: 'academic',
      title: '',
      message: '',
      priority: 'info',
      channel: 'all',
      actionRequired: false
    });
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    // API call will be implemented here
  };

  const handleResendNotification = (notificationId: string) => {
    console.log('Resending notification:', notificationId);
    // API call will be implemented here
  };

  const handleDeleteNotification = (notificationId: string) => {
    console.log('Deleting notification:', notificationId);
    // API call will be implemented here
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Veli Bildirim Merkezi
              </CardTitle>
              <CardDescription>
                Velilere bildirim gönderin ve yönetin
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCreatingTemplate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Şablon Oluştur
              </Button>
              <Button onClick={() => setIsCreatingNotification(true)}>
                <Send className="h-4 w-4 mr-2" />
                Bildirim Gönder
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>Bildirim Ara</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Başlık, mesaj, veli veya öğrenci ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                  <SelectItem value="sent">Gönderildi</SelectItem>
                  <SelectItem value="delivered">Teslim Edildi</SelectItem>
                  <SelectItem value="read">Okundu</SelectItem>
                  <SelectItem value="failed">Başarısız</SelectItem>
                  <SelectItem value="scheduled">Planlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tür</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="academic">Akademik</SelectItem>
                  <SelectItem value="behavioral">Davranış</SelectItem>
                  <SelectItem value="attendance">Devamsızlık</SelectItem>
                  <SelectItem value="administrative">İdari</SelectItem>
                  <SelectItem value="event">Etkinlik</SelectItem>
                  <SelectItem value="emergency">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Öncelik</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="critical">Kritik</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                  <SelectItem value="warning">Uyarı</SelectItem>
                  <SelectItem value="info">Bilgi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bildirim</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.sent} gönderildi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teslim Oranı</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              %{notificationStats.deliveryRate.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.delivered} teslim edildi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Okunma Oranı</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              %{notificationStats.readRate.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.read} okundu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {notificationStats.pending + notificationStats.scheduled}
            </div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.scheduled} planlandı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="templates">Şablonlar</TabsTrigger>
          <TabsTrigger value="scheduled">Planlandı</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Son Bildirimler
                </CardTitle>
                <CardDescription>
                  En son gönderilen bildirimler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNotifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.notification.type)}
                        {getPriorityIcon(notification.notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{notification.notification.title}</p>
                          <Badge variant="outline" className={getStatusColor(notification.status)}>
                            {getStatusIcon(notification.status)}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(notification.notification.priority)}>
                            {notification.notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{notification.notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {notification.parent.name}
                          </div>
                          <div className="flex items-center gap-1">
                            {getChannelIcon(notification.notification.channel)}
                            {notification.notification.channel}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.createdAt).toLocaleString('tr-TR')}
                          </div>
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

            {/* Channel Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Kanal Performansı
                </CardTitle>
                <CardDescription>
                  Bildirim kanallarının kullanım oranları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(channelStats).map(([channel, count]) => (
                    <div key={channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(channel)}
                        <span className="font-medium capitalize">
                          {channel === 'all' ? 'Tüm Kanallar' : 
                           channel === 'app' ? 'Uygulama' :
                           channel === 'email' ? 'E-posta' :
                           channel === 'sms' ? 'SMS' :
                           channel === 'push' ? 'Push' : channel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{count}</div>
                          <div className="text-xs text-gray-600">bildirim</div>
                        </div>
                        <div className="w-20">
                          <Progress value={(count / notificationStats.total) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Bildirim Türleri
              </CardTitle>
              <CardDescription>
                Türe göre bildirim dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(typeStats).map(([type, count]) => (
                  <div key={type} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(type)}
                      <h3 className="font-medium">
                        {type === 'academic' ? 'Akademik' :
                         type === 'behavioral' ? 'Davranış' :
                         type === 'attendance' ? 'Devamsızlık' :
                         type === 'administrative' ? 'İdari' :
                         type === 'event' ? 'Etkinlik' :
                         type === 'emergency' ? 'Acil' : type}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600">
                      %{((count / notificationStats.total) * 100).toFixed(1)} oranında
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Bildirimler</CardTitle>
              <CardDescription>
                Gönderilen ve planlanmış bildirimler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.notification.type)}
                          {getPriorityIcon(notification.notification.priority)}
                        </div>
                        <div>
                          <h3 className="font-medium">{notification.notification.title}</h3>
                          <p className="text-sm text-gray-600">
                            {notification.parent.name}
                            {notification.student && ` • ${notification.student.name} - ${notification.student.class}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(notification.status)}>
                          {getStatusIcon(notification.status)}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(notification.notification.priority)}>
                          {notification.notification.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{notification.notification.message}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          {getChannelIcon(notification.notification.channel)}
                          <span>{notification.notification.channel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(notification.createdAt).toLocaleString('tr-TR')}</span>
                        </div>
                        {notification.sentAt && (
                          <div className="flex items-center gap-1">
                            <Send className="h-4 w-4" />
                            <span>{new Date(notification.sentAt).toLocaleString('tr-TR')}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Detay
                        </Button>
                        {notification.status === 'failed' && (
                          <Button variant="outline" size="sm" onClick={() => handleResendNotification(notification.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Tekrar Gönder
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleDeleteNotification(notification.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Şablonları</CardTitle>
              <CardDescription>
                Önceden hazırlanmış bildirim şablonları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationTemplates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(template.type)}
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-gray-600">{template.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityColor(template.priority)}>
                          {template.priority}
                        </Badge>
                        <Badge variant="outline" className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {template.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{template.message}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          {getChannelIcon(template.channel)}
                          <span>{template.channel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          <span>{template.usageCount} kullanım</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{template.actionRequired ? 'Eylem gerekli' : 'Bilgilendirme'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Kullan
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planlanmış Bildirimler</CardTitle>
              <CardDescription>
                Gelecekte gönderilecek bildirimler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => n.status === 'scheduled').map((notification) => (
                  <div key={notification.id} className="p-4 border rounded-lg bg-purple-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.notification.type)}
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium">{notification.notification.title}</h3>
                          <p className="text-sm text-gray-600">
                            {notification.parent.name}
                            {notification.student && ` • ${notification.student.name} - ${notification.student.class}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          <Calendar className="h-4 w-4 mr-1" />
                          Planlandı
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(notification.notification.priority)}>
                          {notification.notification.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{notification.notification.message}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Gönderim: {notification.scheduledFor && new Date(notification.scheduledFor).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getChannelIcon(notification.notification.channel)}
                          <span>{notification.notification.channel}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Şimdi Gönder
                        </Button>
                        <Button variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          İptal Et
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim İstatistikleri</CardTitle>
                <CardDescription>
                  Detaylı performans metrikleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{notificationStats.total}</div>
                      <div className="text-sm text-blue-800">Toplam Bildirim</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{notificationStats.deliveryRate.toFixed(1)}%</div>
                      <div className="text-sm text-green-800">Teslim Oranı</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Durum Dağılımı</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Gönderildi</span>
                        <span className="text-sm font-medium">{notificationStats.sent}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Teslim Edildi</span>
                        <span className="text-sm font-medium">{notificationStats.delivered}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Okundu</span>
                        <span className="text-sm font-medium">{notificationStats.read}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Başarısız</span>
                        <span className="text-sm font-medium">{notificationStats.failed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Şablon Kullanımı</CardTitle>
                <CardDescription>
                  En çok kullanılan şablonlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationTemplates
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .slice(0, 5)
                    .map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(template.type)}
                          <div>
                            <div className="text-sm font-medium">{template.name}</div>
                            <div className="text-xs text-gray-600">{template.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{template.usageCount}</div>
                          <div className="text-xs text-gray-600">kullanım</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Notification Modal */}
      {isCreatingNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Yeni Bildirim Gönder</CardTitle>
              <CardDescription>
                Velilere bildirim gönderin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bildirim Türü</Label>
                    <Select
                      value={newNotificationData.type}
                      onValueChange={(value) => setNewNotificationData({ ...newNotificationData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Akademik</SelectItem>
                        <SelectItem value="behavioral">Davranış</SelectItem>
                        <SelectItem value="attendance">Devamsızlık</SelectItem>
                        <SelectItem value="administrative">İdari</SelectItem>
                        <SelectItem value="event">Etkinlik</SelectItem>
                        <SelectItem value="emergency">Acil Durum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Öncelik</Label>
                    <Select
                      value={newNotificationData.priority}
                      onValueChange={(value) => setNewNotificationData({ ...newNotificationData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Bilgi</SelectItem>
                        <SelectItem value="warning">Uyarı</SelectItem>
                        <SelectItem value="urgent">Acil</SelectItem>
                        <SelectItem value="critical">Kritik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input
                    placeholder="Bildirim başlığı"
                    value={newNotificationData.title}
                    onChange={(e) => setNewNotificationData({ ...newNotificationData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mesaj</Label>
                  <Textarea
                    placeholder="Bildirim mesajı"
                    value={newNotificationData.message}
                    onChange={(e) => setNewNotificationData({ ...newNotificationData, message: e.target.value })}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gönderim Kanalı</Label>
                    <Select
                      value={newNotificationData.channel}
                      onValueChange={(value) => setNewNotificationData({ ...newNotificationData, channel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app">Uygulama</SelectItem>
                        <SelectItem value="email">E-posta</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Bildirim</SelectItem>
                        <SelectItem value="all">Tüm Kanallar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Planlama (Opsiyonel)</Label>
                    <Input
                      type="datetime-local"
                      value={newNotificationData.scheduledFor}
                      onChange={(e) => setNewNotificationData({ ...newNotificationData, scheduledFor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Eylem Gerekli Mi?</Label>
                    <Switch
                      checked={newNotificationData.actionRequired}
                      onCheckedChange={(checked) => setNewNotificationData({ ...newNotificationData, actionRequired: checked })}
                    />
                  </div>
                  {newNotificationData.actionRequired && (
                    <Input
                      placeholder="Eylem URL'si"
                      value={newNotificationData.actionUrl}
                      onChange={(e) => setNewNotificationData({ ...newNotificationData, actionUrl: e.target.value })}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Son Geçerlilik Tarihi (Opsiyonel)</Label>
                  <Input
                    type="datetime-local"
                    value={newNotificationData.expiresAt}
                    onChange={(e) => setNewNotificationData({ ...newNotificationData, expiresAt: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingNotification(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleSendNotification} disabled={!newNotificationData.title || !newNotificationData.message}>
                    {newNotificationData.scheduledFor ? 'Planla' : 'Gönder'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Template Modal */}
      {isCreatingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Yeni Şablon Oluştur</CardTitle>
              <CardDescription>
                Yeniden kullanılabilir bildirim şablonu oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Şablon Adı</Label>
                  <Input
                    placeholder="Şablon adı"
                    value={newTemplateData.name}
                    onChange={(e) => setNewTemplateData({ ...newTemplateData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tür</Label>
                    <Select
                      value={newTemplateData.type}
                      onValueChange={(value) => setNewTemplateData({ ...newTemplateData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Akademik</SelectItem>
                        <SelectItem value="behavioral">Davranış</SelectItem>
                        <SelectItem value="attendance">Devamsızlık</SelectItem>
                        <SelectItem value="administrative">İdari</SelectItem>
                        <SelectItem value="event">Etkinlik</SelectItem>
                        <SelectItem value="emergency">Acil Durum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Öncelik</Label>
                    <Select
                      value={newTemplateData.priority}
                      onValueChange={(value) => setNewTemplateData({ ...newTemplateData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Bilgi</SelectItem>
                        <SelectItem value="warning">Uyarı</SelectItem>
                        <SelectItem value="urgent">Acil</SelectItem>
                        <SelectItem value="critical">Kritik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input
                    placeholder="Şablon başlığı"
                    value={newTemplateData.title}
                    onChange={(e) => setNewTemplateData({ ...newTemplateData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mesaj</Label>
                  <Textarea
                    placeholder="Şablon mesajı (değişkenler için {variable_name} kullanın)"
                    value={newTemplateData.message}
                    onChange={(e) => setNewTemplateData({ ...newTemplateData, message: e.target.value })}
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-gray-600">
                    Kullanılabilir değişkenler: {'{student_name}'}, {'{parent_name}'}, {'{class_name}'}, {'{subject}'}, {'{grade}'}, {'{date}'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Varsayılan Kanal</Label>
                    <Select
                      value={newTemplateData.channel}
                      onValueChange={(value) => setNewTemplateData({ ...newTemplateData, channel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app">Uygulama</SelectItem>
                        <SelectItem value="email">E-posta</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Bildirim</SelectItem>
                        <SelectItem value="all">Tüm Kanallar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Eylem Gerekli Mi?</Label>
                      <Switch
                        checked={newTemplateData.actionRequired}
                        onCheckedChange={(checked) => setNewTemplateData({ ...newTemplateData, actionRequired: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingTemplate(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleCreateTemplate} disabled={!newTemplateData.name || !newTemplateData.title || !newTemplateData.message}>
                    Şablon Oluştur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}