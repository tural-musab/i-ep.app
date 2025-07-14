/**
 * Parent Messaging System Component
 * Sprint 6: Parent Communication Portal Development
 * İ-EP.APP - Veli Mesajlaşma Sistemi
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
import { 
  MessageSquare, 
  Send, 
  Reply, 
  Forward, 
  Archive, 
  Trash2,
  Search,
  Filter,
  Plus,
  Paperclip,
  Image,
  Phone,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Flag,
  Users,
  Calendar,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    role: 'parent' | 'teacher' | 'admin';
  };
  recipient: {
    id: string;
    name: string;
    avatar: string;
    role: 'parent' | 'teacher' | 'admin';
  };
  student: {
    name: string;
    class: string;
    number: string;
  };
  subject: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'replied';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'inquiry' | 'concern' | 'compliment' | 'meeting_request' | 'general';
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  threadId?: string;
  replyTo?: string;
  isStarred?: boolean;
  isArchived?: boolean;
}

interface MessageThread {
  id: string;
  subject: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    role: 'parent' | 'teacher' | 'admin';
  }[];
  lastMessage: Message;
  unreadCount: number;
  isArchived: boolean;
  messages: Message[];
}

export function ParentMessagingSystem() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isComposing, setIsComposing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Mock data - gerçek uygulamada API'den gelecek
  const [messageThreads] = useState<MessageThread[]>([
    {
      id: '1',
      subject: 'Matematik performansı hakkında',
      participants: [
        {
          id: '1',
          name: 'Ayşe Veli',
          avatar: '/api/placeholder/40/40',
          role: 'parent'
        },
        {
          id: '2',
          name: 'Ahmet Öğretmen',
          avatar: '/api/placeholder/40/40',
          role: 'teacher'
        }
      ],
      lastMessage: {
        id: '1',
        sender: {
          id: '1',
          name: 'Ayşe Veli',
          avatar: '/api/placeholder/40/40',
          role: 'parent'
        },
        recipient: {
          id: '2',
          name: 'Ahmet Öğretmen',
          avatar: '/api/placeholder/40/40',
          role: 'teacher'
        },
        student: {
          name: 'Ali Veli',
          class: '5-A',
          number: '2025001'
        },
        subject: 'Matematik performansı hakkında',
        content: 'Merhaba Ahmet Öğretmen, Ali\'nin matematik dersindeki son durumu hakkında bilgi alabilir miyim? Özellikle geometry konusunda zorlanıyor gibi.',
        timestamp: '2025-01-15T10:30:00',
        status: 'sent',
        priority: 'medium',
        type: 'inquiry'
      },
      unreadCount: 1,
      isArchived: false,
      messages: [
        {
          id: '1',
          sender: {
            id: '1',
            name: 'Ayşe Veli',
            avatar: '/api/placeholder/40/40',
            role: 'parent'
          },
          recipient: {
            id: '2',
            name: 'Ahmet Öğretmen',
            avatar: '/api/placeholder/40/40',
            role: 'teacher'
          },
          student: {
            name: 'Ali Veli',
            class: '5-A',
            number: '2025001'
          },
          subject: 'Matematik performansı hakkında',
          content: 'Merhaba Ahmet Öğretmen, Ali\'nin matematik dersindeki son durumu hakkında bilgi alabilir miyim? Özellikle geometry konusunda zorlanıyor gibi.',
          timestamp: '2025-01-15T10:30:00',
          status: 'sent',
          priority: 'medium',
          type: 'inquiry',
          threadId: '1'
        }
      ]
    },
    {
      id: '2',
      subject: 'Veli toplantısı randevusu',
      participants: [
        {
          id: '3',
          name: 'Mehmet Kaya',
          avatar: '/api/placeholder/40/40',
          role: 'parent'
        },
        {
          id: '4',
          name: 'Zeynep Öğretmen',
          avatar: '/api/placeholder/40/40',
          role: 'teacher'
        }
      ],
      lastMessage: {
        id: '2',
        sender: {
          id: '4',
          name: 'Zeynep Öğretmen',
          avatar: '/api/placeholder/40/40',
          role: 'teacher'
        },
        recipient: {
          id: '3',
          name: 'Mehmet Kaya',
          avatar: '/api/placeholder/40/40',
          role: 'parent'
        },
        student: {
          name: 'Fatma Kaya',
          class: '6-B',
          number: '2025002'
        },
        subject: 'Veli toplantısı randevusu',
        content: 'Merhaba Mehmet Bey, Fatma\'nın okuma gelişimi hakkında konuşmak için bu hafta uygun olduğunuz bir saatiniz var mı?',
        timestamp: '2025-01-15T09:15:00',
        status: 'read',
        priority: 'high',
        type: 'meeting_request'
      },
      unreadCount: 0,
      isArchived: false,
      messages: [
        {
          id: '2',
          sender: {
            id: '3',
            name: 'Mehmet Kaya',
            avatar: '/api/placeholder/40/40',
            role: 'parent'
          },
          recipient: {
            id: '4',
            name: 'Zeynep Öğretmen',
            avatar: '/api/placeholder/40/40',
            role: 'teacher'
          },
          student: {
            name: 'Fatma Kaya',
            class: '6-B',
            number: '2025002'
          },
          subject: 'Veli toplantısı randevusu',
          content: 'Bu hafta müsait olduğunuz bir randevu saati var mı? Fatma\'nın okuma gelişimi hakkında konuşmak istiyorum.',
          timestamp: '2025-01-15T08:30:00',
          status: 'replied',
          priority: 'high',
          type: 'meeting_request',
          threadId: '2'
        },
        {
          id: '3',
          sender: {
            id: '4',
            name: 'Zeynep Öğretmen',
            avatar: '/api/placeholder/40/40',
            role: 'teacher'
          },
          recipient: {
            id: '3',
            name: 'Mehmet Kaya',
            avatar: '/api/placeholder/40/40',
            role: 'parent'
          },
          student: {
            name: 'Fatma Kaya',
            class: '6-B',
            number: '2025002'
          },
          subject: 'Veli toplantısı randevusu',
          content: 'Merhaba Mehmet Bey, Fatma\'nın okuma gelişimi hakkında konuşmak için bu hafta uygun olduğunuz bir saatiniz var mı? Perşembe 15:00 veya Cuma 16:00 uygun olur mu?',
          timestamp: '2025-01-15T09:15:00',
          status: 'read',
          priority: 'high',
          type: 'meeting_request',
          threadId: '2',
          replyTo: '2'
        }
      ]
    }
  ]);

  const [composeData, setComposeData] = useState({
    recipient: '',
    student: '',
    subject: '',
    content: '',
    priority: 'medium',
    type: 'general'
  });

  const [replyData, setReplyData] = useState({
    content: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-purple-100 text-purple-800';
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
      case 'concern': return <AlertCircle className="h-4 w-4" />;
      case 'compliment': return <Star className="h-4 w-4" />;
      case 'meeting_request': return <Calendar className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'read': return <Eye className="h-4 w-4" />;
      case 'replied': return <Reply className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredThreads = messageThreads.filter(thread => {
    const matchesSearch = thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || thread.lastMessage.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || thread.lastMessage.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const selectedThreadData = selectedThread ? messageThreads.find(t => t.id === selectedThread) : null;

  const handleSendMessage = () => {
    if (isComposing) {
      console.log('Sending new message:', composeData);
      // API call will be implemented here
      setIsComposing(false);
      setComposeData({
        recipient: '',
        student: '',
        subject: '',
        content: '',
        priority: 'medium',
        type: 'general'
      });
    }
  };

  const handleSendReply = () => {
    if (replyingTo && replyData.content) {
      console.log('Sending reply:', replyData);
      // API call will be implemented here
      setReplyingTo(null);
      setReplyData({ content: '' });
    }
  };

  const handleMarkAsRead = (threadId: string) => {
    console.log('Marking thread as read:', threadId);
    // API call will be implemented here
  };

  const handleArchiveThread = (threadId: string) => {
    console.log('Archiving thread:', threadId);
    // API call will be implemented here
  };

  const handleDeleteThread = (threadId: string) => {
    console.log('Deleting thread:', threadId);
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
                <MessageSquare className="h-5 w-5" />
                Veli Mesajlaşma Sistemi
              </CardTitle>
              <CardDescription>
                Veliler ile doğrudan iletişim kurun
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsComposing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Mesaj
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>Mesaj Ara</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Mesaj, veli adı veya konu ara..."
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
                  <SelectItem value="sent">Gönderildi</SelectItem>
                  <SelectItem value="delivered">Teslim Edildi</SelectItem>
                  <SelectItem value="read">Okundu</SelectItem>
                  <SelectItem value="replied">Yanıtlandı</SelectItem>
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
                  <SelectItem value="urgent">Acil</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Konuşmalar</CardTitle>
            <CardDescription>
              {filteredThreads.length} konuşma
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2 p-4">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedThread === thread.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedThread(thread.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex -space-x-2">
                        {thread.participants.map((participant, index) => (
                          <Avatar key={index} className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">{thread.subject}</p>
                          {thread.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {thread.participants.map(p => p.name).join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {thread.lastMessage.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={getStatusColor(thread.lastMessage.status)}>
                            {getStatusIcon(thread.lastMessage.status)}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(thread.lastMessage.priority)}>
                            {thread.lastMessage.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(thread.lastMessage.timestamp).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            {selectedThreadData ? (
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(selectedThreadData.lastMessage.type)}
                    {selectedThreadData.subject}
                  </CardTitle>
                  <CardDescription>
                    {selectedThreadData.participants.map(p => p.name).join(', ')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(selectedThreadData.id)}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleArchiveThread(selectedThreadData.id)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteThread(selectedThreadData.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <CardTitle>Mesaj Seçin</CardTitle>
                <CardDescription>
                  Görüntülemek için bir konuşma seçin
                </CardDescription>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedThreadData ? (
              <div className="space-y-6">
                {/* Messages */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {selectedThreadData.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender.role === 'teacher' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`max-w-[70%] ${
                          message.sender.role === 'teacher' ? 'order-2' : 'order-1'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.sender.avatar} />
                              <AvatarFallback>
                                {message.sender.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{message.sender.name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleString('tr-TR')}
                            </span>
                          </div>
                          <div className={`p-3 rounded-lg ${
                            message.sender.role === 'teacher' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={getStatusColor(message.status)}>
                              {getStatusIcon(message.status)}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Reply Interface */}
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Reply className="h-4 w-4" />
                      <span className="text-sm font-medium">Yanıt Ver</span>
                    </div>
                    <Textarea
                      placeholder="Yanıtınızı yazın..."
                      value={replyData.content}
                      onChange={(e) => setReplyData({ content: e.target.value })}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Paperclip className="h-4 w-4 mr-2" />
                          Dosya Ekle
                        </Button>
                        <Button variant="outline" size="sm">
                          <Image className="h-4 w-4 mr-2" />
                          Resim Ekle
                        </Button>
                      </div>
                      <Button onClick={handleSendReply} disabled={!replyData.content}>
                        <Send className="h-4 w-4 mr-2" />
                        Gönder
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Görüntülemek için bir konuşma seçin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Message Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Yeni Mesaj</CardTitle>
              <CardDescription>
                Veli ile yeni bir konuşma başlatın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Alıcı</Label>
                    <Select
                      value={composeData.recipient}
                      onValueChange={(value) => setComposeData({ ...composeData, recipient: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Veli seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent1">Ayşe Veli</SelectItem>
                        <SelectItem value="parent2">Mehmet Kaya</SelectItem>
                        <SelectItem value="parent3">Fatma Demir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Öğrenci</Label>
                    <Select
                      value={composeData.student}
                      onValueChange={(value) => setComposeData({ ...composeData, student: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Öğrenci seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student1">Ali Veli - 5-A</SelectItem>
                        <SelectItem value="student2">Fatma Kaya - 6-B</SelectItem>
                        <SelectItem value="student3">Ahmet Demir - 5-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Konu</Label>
                  <Input
                    placeholder="Mesaj konusu"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Öncelik</Label>
                    <Select
                      value={composeData.priority}
                      onValueChange={(value) => setComposeData({ ...composeData, priority: value })}
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
                  <div className="space-y-2">
                    <Label>Tür</Label>
                    <Select
                      value={composeData.type}
                      onValueChange={(value) => setComposeData({ ...composeData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Genel</SelectItem>
                        <SelectItem value="inquiry">Soru</SelectItem>
                        <SelectItem value="concern">Endişe</SelectItem>
                        <SelectItem value="compliment">Övgü</SelectItem>
                        <SelectItem value="meeting_request">Toplantı Talebi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mesaj</Label>
                  <Textarea
                    placeholder="Mesajınızı yazın..."
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Dosya Ekle
                    </Button>
                    <Button variant="outline" size="sm">
                      <Image className="h-4 w-4 mr-2" />
                      Resim Ekle
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsComposing(false)}>
                      İptal
                    </Button>
                    <Button onClick={handleSendMessage} disabled={!composeData.content || !composeData.recipient}>
                      <Send className="h-4 w-4 mr-2" />
                      Gönder
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}