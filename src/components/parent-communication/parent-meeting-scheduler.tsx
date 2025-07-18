/**
 * Parent Meeting Scheduler Component
 * Sprint 6: Parent Communication Portal Development
 * İ-EP.APP - Veli Toplantı Planlayıcısı
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Edit,
  Trash2,
  RefreshCw,
  User,
  Phone,
  Mail,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Upload,
  Settings,
  Bell,
  Link,
  Copy,
  Archive,
  MoreHorizontal,
  BookOpen,
  FileText,
  Target,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

interface ParentMeeting {
  id: string;
  parent: {
    id: string;
    name: string;
    avatar: string;
    email: string;
    phone: string;
  };
  student: {
    id: string;
    name: string;
    class: string;
    number: string;
  };
  teacher: {
    id: string;
    name: string;
    subject: string;
    avatar: string;
  };
  meeting: {
    title: string;
    description?: string;
    date: string;
    duration: number;
    type: 'individual' | 'group' | 'urgent' | 'routine';
    mode: 'in_person' | 'online' | 'phone';
    location?: string;
    meetingLink?: string;
    agenda?: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  notes?: string;
  actionItems?: string[];
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

interface TimeSlot {
  id: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
  isBlocked: boolean;
  meetingId?: string;
}

interface TeacherSchedule {
  teacherId: string;
  teacherName: string;
  subject: string;
  workingHours: {
    start: string;
    end: string;
  };
  breakTimes: Array<{
    start: string;
    end: string;
    title: string;
  }>;
  availableSlots: TimeSlot[];
  blockedSlots: TimeSlot[];
}

export function ParentMeetingScheduler() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  // Mock data - gerçek uygulamada API'den gelecek
  const [meetings] = useState<ParentMeeting[]>([
    {
      id: '1',
      parent: {
        id: '1',
        name: 'Ayşe Veli',
        avatar: '/api/placeholder/40/40',
        email: 'ayse.veli@parent.com',
        phone: '+90 555 123 4567',
      },
      student: {
        id: '1',
        name: 'Ali Veli',
        class: '5-A',
        number: '2025001',
      },
      teacher: {
        id: '1',
        name: 'Ahmet Öğretmen',
        subject: 'Matematik',
        avatar: '/api/placeholder/40/40',
      },
      meeting: {
        title: 'Dönem sonu değerlendirmesi',
        description: "Ali'nin matematik dersi performansı ve gelişim alanları hakkında görüşme",
        date: '2025-01-18T14:00:00',
        duration: 30,
        type: 'individual',
        mode: 'in_person',
        location: 'Öğretmenler Odası',
        agenda: [
          'Dönem sonu not durumu',
          'Matematik becerilerindeki gelişim',
          'Ev çalışması önerileri',
          'Gelecek dönem hedefleri',
        ],
        priority: 'medium',
      },
      status: 'confirmed',
      createdAt: '2025-01-15T10:00:00',
      updatedAt: '2025-01-15T14:30:00',
      confirmedAt: '2025-01-15T14:30:00',
    },
    {
      id: '2',
      parent: {
        id: '2',
        name: 'Mehmet Kaya',
        avatar: '/api/placeholder/40/40',
        email: 'mehmet.kaya@parent.com',
        phone: '+90 555 234 5678',
      },
      student: {
        id: '2',
        name: 'Fatma Kaya',
        class: '6-B',
        number: '2025002',
      },
      teacher: {
        id: '2',
        name: 'Zeynep Öğretmen',
        subject: 'Türkçe',
        avatar: '/api/placeholder/40/40',
      },
      meeting: {
        title: 'Okuma gelişimi görüşmesi',
        description: "Fatma'nın okuma becerilerinin geliştirilmesi konusunda stratejiler",
        date: '2025-01-19T15:30:00',
        duration: 45,
        type: 'individual',
        mode: 'online',
        meetingLink: 'https://meet.google.com/abc-def-ghi',
        agenda: [
          'Okuma hızı analizi',
          'Anlama becerilerinin değerlendirilmesi',
          'Önerilen kitap listesi',
          'Ev desteği stratejileri',
        ],
        priority: 'high',
      },
      status: 'requested',
      createdAt: '2025-01-14T09:00:00',
      updatedAt: '2025-01-14T09:00:00',
    },
    {
      id: '3',
      parent: {
        id: '3',
        name: 'Fatma Demir',
        avatar: '/api/placeholder/40/40',
        email: 'fatma.demir@parent.com',
        phone: '+90 555 345 6789',
      },
      student: {
        id: '3',
        name: 'Ahmet Demir',
        class: '5-A',
        number: '2025003',
      },
      teacher: {
        id: '3',
        name: 'Mustafa Öğretmen',
        subject: 'Fen Bilgisi',
        avatar: '/api/placeholder/40/40',
      },
      meeting: {
        title: 'Proje çalışması toplantısı',
        description: 'Bilim fuarı projesinin planlanması ve değerlendirilmesi',
        date: '2025-01-20T16:00:00',
        duration: 30,
        type: 'group',
        mode: 'in_person',
        location: 'Fen Laboruvarı',
        agenda: [
          'Proje konusu belirleme',
          'Materyal listesi hazırlama',
          'Zaman çizelgesi oluşturma',
          'Değerlendirme kriterleri',
        ],
        priority: 'medium',
      },
      status: 'confirmed',
      createdAt: '2025-01-13T11:00:00',
      updatedAt: '2025-01-13T16:00:00',
      confirmedAt: '2025-01-13T16:00:00',
    },
    {
      id: '4',
      parent: {
        id: '4',
        name: 'Hasan Yılmaz',
        avatar: '/api/placeholder/40/40',
        email: 'hasan.yilmaz@parent.com',
        phone: '+90 555 456 7890',
      },
      student: {
        id: '4',
        name: 'Zehra Yılmaz',
        class: '6-A',
        number: '2025004',
      },
      teacher: {
        id: '4',
        name: 'Elif Öğretmen',
        subject: 'İngilizce',
        avatar: '/api/placeholder/40/40',
      },
      meeting: {
        title: 'Davranış gelişimi toplantısı',
        description: "Zehra'nın sosyal gelişimi ve sınıf içi davranışları değerlendirmesi",
        date: '2025-01-17T13:30:00',
        duration: 45,
        type: 'urgent',
        mode: 'phone',
        agenda: [
          'Sınıf içi davranış gözlemleri',
          'Sosyal beceri gelişimi',
          'Akran ilişkileri',
          'Ev-okul işbirliği stratejileri',
        ],
        priority: 'urgent',
      },
      status: 'rescheduled',
      createdAt: '2025-01-12T14:00:00',
      updatedAt: '2025-01-14T10:00:00',
    },
  ]);

  const [teacherSchedules] = useState<TeacherSchedule[]>([
    {
      teacherId: '1',
      teacherName: 'Ahmet Öğretmen',
      subject: 'Matematik',
      workingHours: {
        start: '08:00',
        end: '16:00',
      },
      breakTimes: [
        {
          start: '10:00',
          end: '10:15',
          title: 'Teneffüs',
        },
        {
          start: '12:00',
          end: '13:00',
          title: 'Öğle Arası',
        },
      ],
      availableSlots: [
        {
          id: '1',
          teacherId: '1',
          date: '2025-01-18',
          startTime: '14:00',
          endTime: '14:30',
          duration: 30,
          isAvailable: false,
          isBlocked: false,
          meetingId: '1',
        },
        {
          id: '2',
          teacherId: '1',
          date: '2025-01-18',
          startTime: '15:00',
          endTime: '15:30',
          duration: 30,
          isAvailable: true,
          isBlocked: false,
        },
      ],
      blockedSlots: [],
    },
  ]);

  const [meetingFormData, setMeetingFormData] = useState({
    parent: '',
    student: '',
    teacher: '',
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
    type: 'individual',
    mode: 'in_person',
    location: '',
    meetingLink: '',
    agenda: '',
    priority: 'medium',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <User className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'urgent':
        return <AlertCircle className="h-4 w-4" />;
      case 'routine':
        return <Calendar className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'online':
        return <Video className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'rescheduled':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.meeting.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    const matchesType = filterType === 'all' || meeting.meeting.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const upcomingMeetings = meetings.filter(
    (meeting) =>
      new Date(meeting.meeting.date) >= new Date() &&
      (meeting.status === 'confirmed' || meeting.status === 'requested')
  );

  const completedMeetings = meetings.filter((meeting) => meeting.status === 'completed');
  const pendingMeetings = meetings.filter((meeting) => meeting.status === 'requested');

  const meetingStats = {
    total: meetings.length,
    upcoming: upcomingMeetings.length,
    completed: completedMeetings.length,
    pending: pendingMeetings.length,
    cancelled: meetings.filter((m) => m.status === 'cancelled').length,
    averageDuration: meetings.reduce((sum, m) => sum + m.meeting.duration, 0) / meetings.length,
    onlineRatio:
      (meetings.filter((m) => m.meeting.mode === 'online').length / meetings.length) * 100,
    completionRate: (completedMeetings.length / meetings.length) * 100,
  };

  const handleScheduleMeeting = () => {
    console.log('Scheduling meeting:', meetingFormData);
    // API call will be implemented here
    setIsScheduling(false);
    setMeetingFormData({
      parent: '',
      student: '',
      teacher: '',
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 30,
      type: 'individual',
      mode: 'in_person',
      location: '',
      meetingLink: '',
      agenda: '',
      priority: 'medium',
    });
  };

  const handleConfirmMeeting = (meetingId: string) => {
    console.log('Confirming meeting:', meetingId);
    // API call will be implemented here
  };

  const handleCancelMeeting = (meetingId: string) => {
    console.log('Cancelling meeting:', meetingId);
    // API call will be implemented here
  };

  const handleRescheduleMeeting = (meetingId: string) => {
    console.log('Rescheduling meeting:', meetingId);
    // API call will be implemented here
  };

  const handleCompleteMeeting = (meetingId: string, notes: string, actionItems: string[]) => {
    console.log('Completing meeting:', meetingId, notes, actionItems);
    // API call will be implemented here
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Veli Toplantı Planlayıcısı
              </CardTitle>
              <CardDescription>Veli toplantılarını planlayın ve yönetin</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsScheduling(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Toplantı
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Toplantı Ara</Label>
              <div className="relative">
                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Veli, öğrenci, öğretmen veya toplantı ara..."
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
                  <SelectItem value="requested">Talep Edildi</SelectItem>
                  <SelectItem value="confirmed">Onaylandı</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  <SelectItem value="rescheduled">Ertelendi</SelectItem>
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
                  <SelectItem value="individual">Bireysel</SelectItem>
                  <SelectItem value="group">Grup</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                  <SelectItem value="routine">Rutin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Toplantı</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingStats.total}</div>
            <p className="text-muted-foreground text-xs">{meetingStats.upcoming} yaklaşan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{meetingStats.pending}</div>
            <p className="text-muted-foreground text-xs">Onay bekliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{meetingStats.completed}</div>
            <p className="text-muted-foreground text-xs">
              %{meetingStats.completionRate.toFixed(1)} tamamlanma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Süre</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingStats.averageDuration.toFixed(0)} dk</div>
            <p className="text-muted-foreground text-xs">
              %{meetingStats.onlineRatio.toFixed(1)} online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="upcoming">Yaklaşan</TabsTrigger>
          <TabsTrigger value="pending">Bekleyen</TabsTrigger>
          <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Meetings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Son Toplantılar
                </CardTitle>
                <CardDescription>En son planlan ve gerçekleştirilen toplantılar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMeetings.slice(0, 5).map((meeting) => (
                    <div key={meeting.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={meeting.parent.avatar} />
                        <AvatarFallback>
                          {meeting.parent.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-sm font-medium">{meeting.parent.name}</p>
                          <Badge variant="outline" className={getStatusColor(meeting.status)}>
                            {getStatusIcon(meeting.status)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getPriorityColor(meeting.meeting.priority)}
                          >
                            {meeting.meeting.priority}
                          </Badge>
                        </div>
                        <p className="truncate text-sm text-gray-600">{meeting.meeting.title}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(meeting.meeting.date).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meeting.meeting.duration} dk
                          </div>
                          <div className="flex items-center gap-1">
                            {getModeIcon(meeting.meeting.mode)}
                            {meeting.meeting.mode === 'online'
                              ? 'Online'
                              : meeting.meeting.mode === 'in_person'
                                ? 'Yüz yüze'
                                : 'Telefon'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(meeting.meeting.type)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Onay Bekleyen
                </CardTitle>
                <CardDescription>Onayınızı bekleyen toplantı talepleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingMeetings.map((meeting) => (
                    <div key={meeting.id} className="rounded-lg border bg-yellow-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={meeting.parent.avatar} />
                            <AvatarFallback>
                              {meeting.parent.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{meeting.parent.name}</p>
                            <p className="text-xs text-gray-600">
                              {meeting.student.name} - {meeting.student.class}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelMeeting(meeting.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => handleConfirmMeeting(meeting.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{meeting.meeting.title}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(meeting.meeting.date).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meeting.meeting.duration} dk
                          </div>
                          <div className="flex items-center gap-1">
                            {getModeIcon(meeting.meeting.mode)}
                            {meeting.meeting.mode === 'online'
                              ? 'Online'
                              : meeting.meeting.mode === 'in_person'
                                ? 'Yüz yüze'
                                : 'Telefon'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meeting Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Toplantı Analitikleri
              </CardTitle>
              <CardDescription>Toplantı istatistikleri ve performans metrikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{meetingStats.total}</div>
                  <div className="text-sm text-blue-800">Toplam Toplantı</div>
                  <div className="text-xs text-gray-600">Bu dönem</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {meetingStats.completionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-800">Tamamlanma Oranı</div>
                  <div className="text-xs text-gray-600">{meetingStats.completed} tamamlandı</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {meetingStats.averageDuration.toFixed(0)} dk
                  </div>
                  <div className="text-sm text-purple-800">Ortalama Süre</div>
                  <div className="text-xs text-gray-600">Toplantı başına</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Meetings Tab */}
        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Toplantılar</CardTitle>
              <CardDescription>Onaylanmış ve yaklaşan toplantılar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={meeting.parent.avatar} />
                          <AvatarFallback>
                            {meeting.parent.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{meeting.meeting.title}</h3>
                          <p className="text-sm text-gray-600">
                            {meeting.parent.name} • {meeting.student.name} - {meeting.student.class}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(meeting.status)}>
                          {getStatusIcon(meeting.status)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(meeting.meeting.priority)}
                        >
                          {meeting.meeting.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(meeting.meeting.date).toLocaleDateString('tr-TR')}</span>
                          <Clock className="ml-2 h-4 w-4" />
                          <span>
                            {new Date(meeting.meeting.date).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{meeting.meeting.duration} dakika</span>
                          {getTypeIcon(meeting.meeting.type)}
                          <span className="ml-1">
                            {meeting.meeting.type === 'individual' ? 'Bireysel' : 'Grup'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          {getModeIcon(meeting.meeting.mode)}
                          <span>
                            {meeting.meeting.mode === 'online'
                              ? 'Online'
                              : meeting.meeting.mode === 'in_person'
                                ? 'Yüz yüze'
                                : 'Telefon'}
                          </span>
                        </div>
                        {meeting.meeting.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>{meeting.meeting.location}</span>
                          </div>
                        )}
                        {meeting.meeting.meetingLink && (
                          <div className="flex items-center gap-2 text-sm">
                            <Link className="h-4 w-4" />
                            <a
                              href={meeting.meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Toplantı Linki
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {meeting.meeting.agenda && meeting.meeting.agenda.length > 0 && (
                      <div className="mb-3">
                        <h4 className="mb-2 text-sm font-medium">Gündem:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {meeting.meeting.agenda.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-gray-400" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Öğretmen: {meeting.teacher.name}</span>
                        <span>•</span>
                        <span>{meeting.teacher.subject}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRescheduleMeeting(meeting.id)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Ertele
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelMeeting(meeting.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
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

        {/* Pending Meetings Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Toplantılar</CardTitle>
              <CardDescription>Onayınızı bekleyen toplantı talepleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingMeetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-lg border bg-yellow-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={meeting.parent.avatar} />
                          <AvatarFallback>
                            {meeting.parent.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{meeting.meeting.title}</h3>
                          <p className="text-sm text-gray-600">
                            {meeting.parent.name} • {meeting.student.name} - {meeting.student.class}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getPriorityColor(meeting.meeting.priority)}
                        >
                          {meeting.meeting.priority}
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Bekliyor
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(meeting.meeting.date).toLocaleDateString('tr-TR')}</span>
                          <Clock className="ml-2 h-4 w-4" />
                          <span>
                            {new Date(meeting.meeting.date).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{meeting.meeting.duration} dakika</span>
                          {getTypeIcon(meeting.meeting.type)}
                          <span className="ml-1">
                            {meeting.meeting.type === 'individual' ? 'Bireysel' : 'Grup'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          {getModeIcon(meeting.meeting.mode)}
                          <span>
                            {meeting.meeting.mode === 'online'
                              ? 'Online'
                              : meeting.meeting.mode === 'in_person'
                                ? 'Yüz yüze'
                                : 'Telefon'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span>
                            {meeting.teacher.name} - {meeting.teacher.subject}
                          </span>
                        </div>
                      </div>
                    </div>

                    {meeting.meeting.description && (
                      <div className="mb-3">
                        <h4 className="mb-1 text-sm font-medium">Açıklama:</h4>
                        <p className="text-sm text-gray-600">{meeting.meeting.description}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Talep Tarihi: {new Date(meeting.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelMeeting(meeting.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reddet
                        </Button>
                        <Button size="sm" onClick={() => handleConfirmMeeting(meeting.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Onayla
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Meetings Tab */}
        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tamamlanan Toplantılar</CardTitle>
              <CardDescription>Gerçekleştirilen toplantılar ve sonuçları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedMeetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-lg border bg-green-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={meeting.parent.avatar} />
                          <AvatarFallback>
                            {meeting.parent.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{meeting.meeting.title}</h3>
                          <p className="text-sm text-gray-600">
                            {meeting.parent.name} • {meeting.student.name} - {meeting.student.class}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Tamamlandı
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(meeting.meeting.date).toLocaleDateString('tr-TR')}</span>
                          <Clock className="ml-2 h-4 w-4" />
                          <span>{meeting.meeting.duration} dakika</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {getModeIcon(meeting.meeting.mode)}
                          <span>
                            {meeting.meeting.mode === 'online'
                              ? 'Online'
                              : meeting.meeting.mode === 'in_person'
                                ? 'Yüz yüze'
                                : 'Telefon'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span>
                            {meeting.teacher.name} - {meeting.teacher.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {getTypeIcon(meeting.meeting.type)}
                          <span>{meeting.meeting.type === 'individual' ? 'Bireysel' : 'Grup'}</span>
                        </div>
                      </div>
                    </div>

                    {meeting.notes && (
                      <div className="mb-3">
                        <h4 className="mb-1 text-sm font-medium">Toplantı Notları:</h4>
                        <p className="text-sm text-gray-600">{meeting.notes}</p>
                      </div>
                    )}

                    {meeting.actionItems && meeting.actionItems.length > 0 && (
                      <div className="mb-3">
                        <h4 className="mb-2 text-sm font-medium">Eylem Maddeleri:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {meeting.actionItems.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Target className="h-3 w-3" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Tamamlanma: {new Date(meeting.meeting.date).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Rapor İndir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Detay Görüntüle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toplantı Takvimi</CardTitle>
              <CardDescription>Tüm toplantıları takvim görünümünde inceleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">Takvim görünümü yakında eklenecek</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Meeting Modal */}
      {isScheduling && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <CardHeader>
              <CardTitle>Yeni Toplantı Planla</CardTitle>
              <CardDescription>Veli ile toplantı planlayın</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Veli</Label>
                    <Select
                      value={meetingFormData.parent}
                      onValueChange={(value) =>
                        setMeetingFormData({ ...meetingFormData, parent: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Veli seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent1">Ayşe Veli</SelectItem>
                        <SelectItem value="parent2">Mehmet Kaya</SelectItem>
                        <SelectItem value="parent3">Fatma Demir</SelectItem>
                        <SelectItem value="parent4">Hasan Yılmaz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Öğrenci</Label>
                    <Select
                      value={meetingFormData.student}
                      onValueChange={(value) =>
                        setMeetingFormData({ ...meetingFormData, student: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Öğrenci seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student1">Ali Veli - 5-A</SelectItem>
                        <SelectItem value="student2">Fatma Kaya - 6-B</SelectItem>
                        <SelectItem value="student3">Ahmet Demir - 5-A</SelectItem>
                        <SelectItem value="student4">Zehra Yılmaz - 6-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Toplantı Başlığı</Label>
                  <Input
                    placeholder="Toplantı başlığı"
                    value={meetingFormData.title}
                    onChange={(e) =>
                      setMeetingFormData({ ...meetingFormData, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    placeholder="Toplantı açıklaması"
                    value={meetingFormData.description}
                    onChange={(e) =>
                      setMeetingFormData({ ...meetingFormData, description: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Tarih</Label>
                    <Input
                      type="date"
                      value={meetingFormData.date}
                      onChange={(e) =>
                        setMeetingFormData({ ...meetingFormData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Saat</Label>
                    <Input
                      type="time"
                      value={meetingFormData.time}
                      onChange={(e) =>
                        setMeetingFormData({ ...meetingFormData, time: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Süre (dakika)</Label>
                    <Input
                      type="number"
                      value={meetingFormData.duration}
                      onChange={(e) =>
                        setMeetingFormData({
                          ...meetingFormData,
                          duration: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Toplantı Türü</Label>
                    <Select
                      value={meetingFormData.type}
                      onValueChange={(value) =>
                        setMeetingFormData({ ...meetingFormData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Bireysel</SelectItem>
                        <SelectItem value="group">Grup</SelectItem>
                        <SelectItem value="urgent">Acil</SelectItem>
                        <SelectItem value="routine">Rutin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Toplantı Modu</Label>
                    <Select
                      value={meetingFormData.mode}
                      onValueChange={(value) =>
                        setMeetingFormData({ ...meetingFormData, mode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">Yüz Yüze</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="phone">Telefon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {meetingFormData.mode === 'in_person' && (
                  <div className="space-y-2">
                    <Label>Konum</Label>
                    <Input
                      placeholder="Toplantı konumu"
                      value={meetingFormData.location}
                      onChange={(e) =>
                        setMeetingFormData({ ...meetingFormData, location: e.target.value })
                      }
                    />
                  </div>
                )}

                {meetingFormData.mode === 'online' && (
                  <div className="space-y-2">
                    <Label>Toplantı Linki</Label>
                    <Input
                      placeholder="Toplantı linki"
                      value={meetingFormData.meetingLink}
                      onChange={(e) =>
                        setMeetingFormData({ ...meetingFormData, meetingLink: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Gündem</Label>
                  <Textarea
                    placeholder="Gündem maddelerini satır satır yazın"
                    value={meetingFormData.agenda}
                    onChange={(e) =>
                      setMeetingFormData({ ...meetingFormData, agenda: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Öncelik</Label>
                  <Select
                    value={meetingFormData.priority}
                    onValueChange={(value) =>
                      setMeetingFormData({ ...meetingFormData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Acil</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="low">Düşük</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsScheduling(false)}>
                    İptal
                  </Button>
                  <Button
                    onClick={handleScheduleMeeting}
                    disabled={!meetingFormData.title || !meetingFormData.parent}
                  >
                    Toplantı Planla
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
