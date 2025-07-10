'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Trash2, 
  Send,
  MessageSquare, 
  Bell,
  Megaphone,
  Eye,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'parent' | 'admin' | 'student';
  recipientId: string;
  recipientName: string;
  recipientRole: 'teacher' | 'parent' | 'admin' | 'student';
  subject: string;
  content: string;
  sentAt: string;
  readAt?: string;
  status: 'sent' | 'delivered' | 'read';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: string[];
  tenantId: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetAudience: 'all' | 'teachers' | 'parents' | 'students' | 'class_specific';
  targetClasses?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  publishDate: string;
  expiryDate?: string;
  status: 'draft' | 'published' | 'expired';
  readBy: string[];
  attachments?: string[];
  tenantId: string;
}

interface Notification {
  id: string;
  type: 'grade_entered' | 'assignment_due' | 'absence_alert' | 'announcement' | 'message' | 'system';
  title: string;
  message: string;
  recipientId: string;
  recipientRole: 'teacher' | 'parent' | 'admin' | 'student';
  sentAt: string;
  readAt?: string;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'read';
  tenantId: string;
}

const messageColumns = [
  {
    accessorKey: 'senderName',
    header: 'Gönderen',
    cell: ({ row }: { row: { getValue: (key: string) => string; original: Message } }) => {
      const name = row.getValue('senderName');
      const role = row.original.senderRole;
      const roleLabels = {
        teacher: 'Öğretmen',
        parent: 'Veli',
        admin: 'Yönetici',
        student: 'Öğrenci',
      };
      return (
        <div>
          <span className="font-medium">{name}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {roleLabels[role]}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'recipientName',
    header: 'Alıcı',
    cell: ({ row }: { row: { getValue: (key: string) => string; original: Message } }) => {
      const name = row.getValue('recipientName');
      const role = row.original.recipientRole;
      const roleLabels = {
        teacher: 'Öğretmen',
        parent: 'Veli',
        admin: 'Yönetici',
        student: 'Öğrenci',
      };
      return (
        <div>
          <span className="font-medium">{name}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {roleLabels[role]}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'subject',
    header: 'Konu',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const subject = row.getValue('subject');
      return <span className="font-medium">{subject}</span>;
    },
  },
  {
    accessorKey: 'sentAt',
    header: 'Gönderilme',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const date = new Date(row.getValue('sentAt'));
      return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    },
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      const statusConfig = {
        sent: { label: 'Gönderildi', variant: 'secondary' as const },
        delivered: { label: 'Ulaştı', variant: 'default' as const },
        read: { label: 'Okundu', variant: 'outline' as const },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'priority',
    header: 'Öncelik',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const priority = row.getValue('priority');
      const priorityConfig = {
        low: { label: 'Düşük', variant: 'outline' as const },
        normal: { label: 'Normal', variant: 'secondary' as const },
        high: { label: 'Yüksek', variant: 'default' as const },
        urgent: { label: 'Acil', variant: 'destructive' as const },
      };
      const config = priorityConfig[priority as keyof typeof priorityConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
];

const announcementColumns = [
  {
    accessorKey: 'title',
    header: 'Başlık',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const title = row.getValue('title');
      return <span className="font-medium">{title}</span>;
    },
  },
  {
    accessorKey: 'authorName',
    header: 'Yazar',
  },
  {
    accessorKey: 'targetAudience',
    header: 'Hedef Kitle',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const audience = row.getValue('targetAudience');
      const audienceLabels = {
        all: 'Herkes',
        teachers: 'Öğretmenler',
        parents: 'Veliler',
        students: 'Öğrenciler',
        class_specific: 'Belirli Sınıflar',
      };
      return <Badge variant="secondary">{audienceLabels[audience as keyof typeof audienceLabels]}</Badge>;
    },
  },
  {
    accessorKey: 'publishDate',
    header: 'Yayın Tarihi',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const date = new Date(row.getValue('publishDate'));
      return date.toLocaleDateString('tr-TR');
    },
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      const statusConfig = {
        draft: { label: 'Taslak', variant: 'secondary' as const },
        published: { label: 'Yayında', variant: 'default' as const },
        expired: { label: 'Süresi Doldu', variant: 'outline' as const },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'readBy',
    header: 'Okunma',
    cell: ({ row }: { row: { getValue: (key: string) => string[] } }) => {
      const readBy = row.getValue('readBy');
      return <span className="text-blue-600 font-semibold">{readBy.length} kişi</span>;
    },
  },
];

export default function CommunicationPage() {
  const { currentTenantId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  // TODO: Bu state'ler düzenleme özelliği için kullanılacak
  // const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  // const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Mock data
  const mockMessages = useMemo(() => [
    {
      id: '1',
      senderId: 'teacher1',
      senderName: 'Mehmet Öztürk',
      senderRole: 'teacher',
      recipientId: 'parent1',
      recipientName: 'Fatma Yılmaz',
      recipientRole: 'parent',
      subject: 'Ahmet\'in Matematik Başarısı',
      content: 'Merhaba, Ahmet matematik dersinde çok başarılı. Tebrikler.',
      sentAt: '2024-12-10T14:30:00',
      readAt: '2024-12-10T16:45:00',
      status: 'read',
      priority: 'normal',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '2',
      senderId: 'admin1',
      senderName: 'Okul Müdürü',
      senderRole: 'admin',
      recipientId: 'teacher1',
      recipientName: 'Mehmet Öztürk',
      recipientRole: 'teacher',
      subject: 'Veli Toplantısı Hatırlatması',
      content: 'Yarın saat 19:00\'da veli toplantısı olduğunu hatırlatırım.',
      sentAt: '2024-12-11T10:15:00',
      status: 'delivered',
      priority: 'high',
      tenantId: currentTenantId || 'demo-school',
    },
  ], [currentTenantId]);

  const mockAnnouncements = useMemo(() => [
    {
      id: '1',
      title: 'Karne Dağıtım Tarihi',
      content: 'Karne dağıtımı 25 Aralık Çarşamba günü saat 14:00\'te yapılacaktır. Tüm velilerimizi bekliyoruz.',
      authorId: 'admin1',
      authorName: 'Okul Müdürü',
      targetAudience: 'parents',
      priority: 'high',
      publishDate: '2024-12-15',
      expiryDate: '2024-12-25',
      status: 'published',
      readBy: ['parent1', 'parent2'],
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '2',
      title: 'Yılsonu Etkinlikleri',
      content: 'Yılsonu etkinlikleri planlanmaktadır. Detaylar yakında duyurulacaktır.',
      authorId: 'admin1',
      authorName: 'Okul Müdürü',
      targetAudience: 'all',
      priority: 'normal',
      publishDate: '2024-12-20',
      status: 'published',
      readBy: ['teacher1', 'parent1'],
      tenantId: currentTenantId || 'demo-school',
    },
  ], [currentTenantId]);

  const mockNotifications = useMemo(() => [
    {
      id: '1',
      type: 'grade_entered',
      title: 'Yeni Not Girişi',
      message: 'Ahmet Yılmaz\'a Matematik dersi için not girildi.',
      recipientId: 'parent1',
      recipientRole: 'parent',
      sentAt: '2024-12-10T15:30:00',
      readAt: '2024-12-10T16:00:00',
      priority: 'normal',
      status: 'read',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '2',
      type: 'absence_alert',
      title: 'Devamsızlık Uyarısı',
      message: 'Ayşe Demir bugün derse gelmedi.',
      recipientId: 'parent2',
      recipientRole: 'parent',
      sentAt: '2024-12-11T08:30:00',
      priority: 'high',
      status: 'sent',
      tenantId: currentTenantId || 'demo-school',
    },
  ], [currentTenantId]);

  useEffect(() => {
    const loadCommunicationData = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setMessages(mockMessages);
          setAnnouncements(mockAnnouncements);
          setNotifications(mockNotifications);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('İletişim verileri yüklenirken hata:', error);
        setLoading(false);
      }
    };

    if (currentTenantId) {
      loadCommunicationData();
    }
  }, [currentTenantId, mockMessages, mockAnnouncements, mockNotifications]);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter;
    const matchesRole = roleFilter === 'all' || message.senderRole === roleFilter || message.recipientRole === roleFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesRole;
  });

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const MessageForm = () => (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Alıcı</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Alıcı seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teacher1">Mehmet Öztürk (Öğretmen)</SelectItem>
              <SelectItem value="parent1">Fatma Yılmaz (Veli)</SelectItem>
              <SelectItem value="admin1">Okul Müdürü (Yönetici)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öncelik</label>
          <Select defaultValue="normal">
            <SelectTrigger>
              <SelectValue placeholder="Öncelik seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Düşük</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
              <SelectItem value="urgent">Acil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Konu</label>
        <Input 
          placeholder="Mesaj konusu"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mesaj</label>
        <Textarea 
          placeholder="Mesajınızı yazın..."
          rows={6}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsMessageDialogOpen(false)}
        >
          İptal
        </Button>
        <Button type="submit">
          <Send className="h-4 w-4 mr-2" />
          Gönder
        </Button>
      </div>
    </form>
  );

  const AnnouncementForm = () => (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Başlık</label>
        <Input 
          placeholder="Duyuru başlığı"
          // defaultValue={selectedAnnouncement?.title} // This line was removed as per the new_code
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hedef Kitle</label>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Hedef kitle seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Herkes</SelectItem>
              <SelectItem value="teachers">Öğretmenler</SelectItem>
              <SelectItem value="parents">Veliler</SelectItem>
              <SelectItem value="students">Öğrenciler</SelectItem>
              <SelectItem value="class_specific">Belirli Sınıflar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öncelik</label>
          <Select defaultValue="normal">
            <SelectTrigger>
              <SelectValue placeholder="Öncelik seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Düşük</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
              <SelectItem value="urgent">Acil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yayın Tarihi</label>
          <Input 
            type="date"
            // defaultValue={selectedAnnouncement?.publishDate} // This line was removed as per the new_code
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Son Tarih (Opsiyonel)</label>
          <Input 
            type="date"
            // defaultValue={selectedAnnouncement?.expiryDate} // This line was removed as per the new_code
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">İçerik</label>
        <Textarea 
          placeholder="Duyuru içeriği..."
          rows={8}
          // defaultValue={selectedAnnouncement?.content} // This line was removed as per the new_code
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsAnnouncementDialogOpen(false)}
        >
          İptal
        </Button>
        <Button type="submit" variant="outline">
          Taslak Kaydet
        </Button>
        <Button type="submit">
          <Megaphone className="h-4 w-4 mr-2" />
          Yayınla
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">İletişim Merkezi</h1>
          <p className="text-gray-600">Mesajlar, duyurular ve bildirimler</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mesaj Gönder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Mesaj</DialogTitle>
              </DialogHeader>
              <MessageForm />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Megaphone className="h-4 w-4 mr-2" />
                Duyuru Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Duyuru</DialogTitle>
              </DialogHeader>
              <AnnouncementForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Mesaj</p>
                <p className="text-xl font-semibold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Okundu</p>
                <p className="text-xl font-semibold">
                  {messages.filter(m => m.status === 'read').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Megaphone className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif Duyuru</p>
                <p className="text-xl font-semibold">
                  {announcements.filter(a => a.status === 'published').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-full">
                <Bell className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Okunmamış Bildirim</p>
                <p className="text-xl font-semibold">
                  {notifications.filter(n => n.status === 'sent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Mesajlar</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center space-x-2">
            <Megaphone className="h-4 w-4" />
            <span>Duyurular</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Bildirimler</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mesajlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Mesaj ara"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Durum filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="sent">Gönderildi</SelectItem>
                    <SelectItem value="delivered">Ulaştı</SelectItem>
                    <SelectItem value="read">Okundu</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Öncelik filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Öncelikler</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Rol filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Roller</SelectItem>
                    <SelectItem value="teacher">Öğretmen</SelectItem>
                    <SelectItem value="parent">Veli</SelectItem>
                    <SelectItem value="admin">Yönetici</SelectItem>
                    <SelectItem value="student">Öğrenci</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                columns={messageColumns}
                data={filteredMessages}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Duyurular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Duyuru ara"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Durum filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="published">Yayında</SelectItem>
                    <SelectItem value="expired">Süresi Doldu</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Öncelik filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Öncelikler</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                columns={announcementColumns}
                data={filteredAnnouncements}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bildirimler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg ${notification.status === 'sent' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${notification.status === 'sent' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Bell className={`h-4 w-4 ${notification.status === 'sent' ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.sentAt).toLocaleDateString('tr-TR')} {new Date(notification.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <Badge 
                              variant={notification.priority === 'urgent' ? 'destructive' : notification.priority === 'high' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {notification.priority === 'urgent' ? 'Acil' : notification.priority === 'high' ? 'Yüksek' : notification.priority === 'normal' ? 'Normal' : 'Düşük'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {notification.status === 'sent' && (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}