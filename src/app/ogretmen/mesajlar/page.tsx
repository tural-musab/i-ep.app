'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { TeacherGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useAuth } from '@/lib/auth/auth-context';
import { useWebSocket } from '@/lib/realtime/websocket-client';
import { useMessageNotifications } from '@/lib/realtime/notification-system';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle,
  Send,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Clock,
  User,
  Paperclip,
  CheckCircle,
  Circle,
  RefreshCw,
  Users,
  BookOpen,
  Star
} from 'lucide-react';
import Link from 'next/link';

// Extended message types for teacher interface
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher' | 'admin' | 'student';
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
}

interface MessageThread {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'parent' | 'admin' | 'student';
  subject: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
  studentName?: string;
  className?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isStarred: boolean;
}

// Demo messaging data for teacher interface
const DEMO_TEACHER_MESSAGE_THREADS: MessageThread[] = [
  {
    id: '1',
    participantId: 'parent-1',
    participantName: 'Mehmet Kaya',
    participantRole: 'parent',
    subject: 'Ali\'nin Matematik Performansı',
    studentName: 'Ali Kaya',
    className: '10-A',
    priority: 'normal',
    isStarred: true,
    unreadCount: 1,
    lastMessage: {
      id: 'msg-6',
      senderId: 'parent-1',
      senderName: 'Mehmet Kaya',
      senderRole: 'parent',
      receiverId: 'teacher-1',
      receiverName: 'Ahmet Yılmaz',
      content: 'Çok teşekkür ederim. Evde matematik çalışması için önerdiğiniz kaynakları kullanacağız.',
      timestamp: '2025-01-25T15:45:00Z',
      isRead: false,
      priority: 'normal'
    },
    messages: [
      {
        id: 'msg-1',
        senderId: 'parent-1',
        senderName: 'Mehmet Kaya',
        senderRole: 'parent',
        receiverId: 'teacher-1',
        receiverName: 'Ahmet Yılmaz',
        content: 'Merhaba Ahmet Bey, Ali\'nin matematik dersindeki durumu hakkında bilgi alabilir miyim?',
        timestamp: '2025-01-25T10:15:00Z',
        isRead: true,
        priority: 'normal'
      },
      {
        id: 'msg-2',
        senderId: 'teacher-1',
        senderName: 'Ahmet Yılmaz',
        senderRole: 'teacher',
        receiverId: 'parent-1',
        receiverName: 'Mehmet Kaya',
        content: 'Merhaba Mehmet Bey, Ali genel olarak başarılı bir öğrenci. Son sınavda 85 almış.',
        timestamp: '2025-01-25T11:20:00Z',
        isRead: true,
        priority: 'normal'
      },
      {
        id: 'msg-6',
        senderId: 'parent-1',
        senderName: 'Mehmet Kaya',
        senderRole: 'parent',
        receiverId: 'teacher-1',
        receiverName: 'Ahmet Yılmaz',
        content: 'Çok teşekkür ederim. Evde matematik çalışması için önerdiğiniz kaynakları kullanacağız.',
        timestamp: '2025-01-25T15:45:00Z',
        isRead: false,
        priority: 'normal'
      }
    ]
  },
  {
    id: '2',
    participantId: 'parent-2',
    participantName: 'Fatma Çelik',
    participantRole: 'parent',
    subject: 'Emre\'nin Devamsızlık Durumu',
    studentName: 'Emre Çelik',
    className: '10-A',
    priority: 'high',
    isStarred: false,
    unreadCount: 2,
    lastMessage: {
      id: 'msg-9',
      senderId: 'parent-2',
      senderName: 'Fatma Çelik',
      senderRole: 'parent',
      receiverId: 'teacher-1',
      receiverName: 'Ahmet Yılmaz',
      content: 'Anlıyorum, bu durumda ne yapmamız gerekiyor?',
      timestamp: '2025-01-25T13:20:00Z',
      isRead: false,
      priority: 'high'
    },
    messages: [
      {
        id: 'msg-7',
        senderId: 'teacher-1',
        senderName: 'Ahmet Yılmaz',
        senderRole: 'teacher',
        receiverId: 'parent-2',
        receiverName: 'Fatma Çelik',
        content: 'Merhaba Fatma Hanım, Emre\'nin bu hafta 3 gün matematik dersinde yoktu.',
        timestamp: '2025-01-25T12:00:00Z',
        isRead: true,
        priority: 'high'
      },
      {
        id: 'msg-8',
        senderId: 'parent-2',
        senderName: 'Fatma Çelik',
        senderRole: 'parent',
        receiverId: 'teacher-1',
        receiverName: 'Ahmet Yılmaz',
        content: 'Emre bana hastalık nedeniyle geldiğini söyledi, durum farklı mı?',
        timestamp: '2025-01-25T12:30:00Z',
        isRead: true,
        priority: 'high'
      },
      {
        id: 'msg-9',
        senderId: 'parent-2',
        senderName: 'Fatma Çelik',
        senderRole: 'parent',
        receiverId: 'teacher-1',
        receiverName: 'Ahmet Yılmaz',
        content: 'Anlıyorum, bu durumda ne yapmamız gerekiyor?',
        timestamp: '2025-01-25T13:20:00Z',
        isRead: false,
        priority: 'high'
      }
    ]
  },
  {
    id: '3',
    participantId: 'admin-1',
    participantName: 'Mehmet Yılmaz',
    participantRole: 'admin',
    subject: 'Dönem Sonu Toplantısı',
    priority: 'urgent',
    isStarred: true,
    unreadCount: 1,
    lastMessage: {
      id: 'msg-12',
      senderId: 'admin-1',
      senderName: 'Mehmet Yılmaz',
      senderRole: 'admin',
      receiverId: 'teacher-1',
      receiverName: 'Ahmet Yılmaz',
      content: 'Toplantı Pazartesi 14:00\'te. Not girişleri için son tarih Cuma.',
      timestamp: '2025-01-25T11:00:00Z',
      isRead: false,
      priority: 'urgent'
    },
    messages: [
      {
        id: 'msg-10',
        senderId: 'admin-1',
        senderName: 'Mehmet Yılmaz',
        senderRole: 'admin',
        receiverId: 'teacher-1',
        receiverName: 'Ahmet Yılmaz',
        content: 'Ahmet Bey, dönem sonu değerlendirme toplantısı için hazırlıklar başladı.',
        timestamp: '2025-01-25T10:30:00Z',
        isRead: true,
        priority: 'urgent'
      },
      {
        id: 'msg-12',
        senderId: 'admin-1',
        senderName: 'Mehmet Yılmaz',
        senderRole: 'admin',
        receiverId: 'teacher-1',
        receiverName: 'Ahmet Yılmaz',
        content: 'Toplantı Pazartesi 14:00\'te. Not girişleri için son tarih Cuma.',
        timestamp: '2025-01-25T11:00:00Z',
        isRead: false,
        priority: 'urgent'
      }
    ]
  },
  {
    id: '4',
    participantId: 'student-1',
    participantName: 'Zeynep Şahin',
    participantRole: 'student',
    subject: 'Matematik Ek Ders Talebi',
    className: '11-B',
    priority: 'normal',
    isStarred: false,
    unreadCount: 0,
    lastMessage: {
      id: 'msg-15',
      senderId: 'teacher-1',
      senderName: 'Ahmet Yılmaz',
      senderRole: 'teacher',
      receiverId: 'student-1',
      receiverName: 'Zeynep Şahin',
      content: 'Elbette Zeynep, Çarşamba öğleden sonra müsaitim. 15:00-16:00 arası uygun mu?',
      timestamp: '2025-01-24T16:30:00Z',
      isRead: true,
      priority: 'normal'
    },
    messages: [
      {
        id: 'msg-13',
        senderId: 'student-1',
        senderName: 'Zeynep Şahin',
        senderRole: 'student',
        receiverId: 'teacher-1',
        receiverName: 'Ahmet Yılmaz',
        content: 'Ahmet Hocam, türev konusunda ek ders alabilir miyim?',
        timestamp: '2025-01-24T15:45:00Z',
        isRead: true,
        priority: 'normal'
      },
      {
        id: 'msg-15',
        senderId: 'teacher-1',
        senderName: 'Ahmet Yılmaz',
        senderRole: 'teacher',
        receiverId: 'student-1',
        receiverName: 'Zeynep Şahin',
        content: 'Elbette Zeynep, Çarşamba öğleden sonra müsaitim. 15:00-16:00 arası uygun mu?',
        timestamp: '2025-01-24T16:30:00Z',
        isRead: true,
        priority: 'normal'
      }
    ]
  }
];

function TeacherMessagingContent() {
  const { user } = useAuth();
  const { client: wsClient, isConnected, sendMessage: wsSendMessage } = useWebSocket();
  const { notifyNewMessage } = useMessageNotifications();
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  // Load message threads
  useEffect(() => {
    async function loadMessageThreads() {
      setIsLoading(true);
      try {
        // TODO: Replace with real API call
        // const response = await fetch('/api/messages/threads/teacher');
        // const result = await response.json();
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        setMessageThreads(DEMO_TEACHER_MESSAGE_THREADS);
      } catch (error) {
        console.error('Error loading message threads:', error);
        setMessageThreads(DEMO_TEACHER_MESSAGE_THREADS);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessageThreads();
  }, []);

  // WebSocket connection status
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  // Set up WebSocket message listeners
  useEffect(() => {
    if (!wsClient) return;

    const handleNewMessage = (message: any) => {
      if (message.type === 'new_message') {
        // Update message threads with new message
        setMessageThreads(prev => 
          prev.map(thread => {
            if (thread.id === message.data.threadId) {
              const newMsg: Message = {
                id: message.data.id,
                senderId: message.data.senderId,
                senderName: message.data.senderName || 'Unknown',
                senderRole: message.data.senderRole,
                receiverId: message.data.receiverId,
                receiverName: message.data.receiverName || 'Unknown',
                content: message.data.content,
                timestamp: message.data.timestamp,
                isRead: false,
                priority: message.data.priority || 'normal'
              };
              
              return {
                ...thread,
                messages: [...thread.messages, newMsg],
                lastMessage: newMsg,
                unreadCount: thread.unreadCount + 1
              };
            }
            return thread;
          })
        );

        // Show notification if not current thread
        if (!selectedThread || selectedThread.id !== message.data.threadId) {
          notifyNewMessage(
            message.data.threadId,
            message.data.senderName,
            message.data.content,
            message.data.priority || 'normal'
          );
        }
      }
    };

    wsClient.on('new_message', handleNewMessage);
    wsClient.on('*', handleNewMessage);

    return () => {
      wsClient.off('new_message', handleNewMessage);
      wsClient.off('*', handleNewMessage);
    };
  }, [wsClient, selectedThread, notifyNewMessage]);

  // Filter threads
  const filteredThreads = messageThreads.filter(thread => {
    const matchesSearch = thread.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (thread.studentName && thread.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || thread.priority === priorityFilter;
    const matchesRole = roleFilter === 'all' || thread.participantRole === roleFilter;
    
    return matchesSearch && matchesPriority && matchesRole;
  });

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || isSending) return;

    setIsSending(true);
    try {
      // Try WebSocket first, fallback to API
      if (wsClient && isConnected && wsSendMessage) {
        wsSendMessage(
          selectedThread.id,
          selectedThread.participantId,
          newMessage,
          'normal'
        );
      } else {
        // Fallback to API call
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: selectedThread.id,
            content: newMessage,
            receiverId: selectedThread.participantId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }
      }

      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        senderId: user?.id || 'teacher-1',
        senderName: user?.profile?.fullName || 'Ahmet Yılmaz',
        senderRole: 'teacher',
        receiverId: selectedThread.participantId,
        receiverName: selectedThread.participantName,
        content: newMessage,
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'normal'
      };

      // Update the selected thread
      const updatedThread = {
        ...selectedThread,
        messages: [...selectedThread.messages, newMsg],
        lastMessage: newMsg
      };

      setSelectedThread(updatedThread);
      
      // Update threads list
      setMessageThreads(prev => 
        prev.map(thread => 
          thread.id === selectedThread.id ? updatedThread : thread
        )
      );

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error notification to user
    } finally {
      setIsSending(false);
    }
  };

  // Toggle star
  const toggleStar = (threadId: string) => {
    setMessageThreads(prev => 
      prev.map(thread => 
        thread.id === threadId ? { ...thread, isStarred: !thread.isStarred } : thread
      )
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Acil</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Yüksek</Badge>;
      case 'normal':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Normal</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-gray-500 text-gray-600">Düşük</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'parent':
        return <Badge variant="outline" className="border-purple-500 text-purple-600">Veli</Badge>;
      case 'admin':
        return <Badge variant="outline" className="border-red-500 text-red-600">Yönetici</Badge>;
      case 'student':
        return <Badge variant="outline" className="border-green-500 text-green-600">Öğrenci</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Bugün ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 2) {
      return `Dün ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Get unread count
  const totalUnreadCount = messageThreads.reduce((total, thread) => total + thread.unreadCount, 0);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Mesajlar yükleniyor...</span>
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
            <Link href="/ogretmen">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Öğretmen Paneli'ne Dön
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Mesajlaşma</h1>
              <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${
                connectionStatus === 'connected' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                {connectionStatus === 'connected' ? 'Çevrimiçi' : 'Çevrimdışı'}
              </div>
            </div>
            <p className="mt-2 text-gray-600">
              Veliler, öğrenciler ve okul yönetimiyle gerçek zamanlı iletişim
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {totalUnreadCount > 0 && (
              <Badge variant="destructive">
                {totalUnreadCount} okunmamış
              </Badge>
            )}
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Mesaj
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Threads List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Konuşmalar ({filteredThreads.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="all">Tüm Öncelikler</option>
                    <option value="urgent">Acil</option>
                    <option value="high">Yüksek</option>
                    <option value="normal">Normal</option>
                    <option value="low">Düşük</option>
                  </select>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="all">Tüm Roller</option>
                    <option value="parent">Veliler</option>
                    <option value="student">Öğrenciler</option>
                    <option value="admin">Yöneticiler</option>
                  </select>
                </div>
              </div>

              {/* Thread List */}
              <div className="space-y-2">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-sm">{thread.participantName}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(thread.id);
                          }}
                        >
                          <Star 
                            className={`h-3 w-3 ${
                              thread.isStarred 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </button>
                      </div>
                      <div className="flex items-center space-x-1">
                        {thread.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-1">
                      {getRoleBadge(thread.participantRole)}
                      {getPriorityBadge(thread.priority)}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-1">{thread.subject}</div>
                    
                    {thread.studentName && (
                      <div className="text-xs text-gray-500 mb-1">
                        <Users className="inline h-3 w-3 mr-1" />
                        {thread.studentName}
                        {thread.className && ` (${thread.className})`}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 line-clamp-2 mb-1">
                      {thread.lastMessage.content}
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(thread.lastMessage.timestamp)}
                    </div>
                  </div>
                ))}

                {filteredThreads.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Arama kriterlerinize uygun konuşma bulunamadı.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Conversation */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      {selectedThread.participantName}
                      <button
                        onClick={() => toggleStar(selectedThread.id)}
                        className="ml-2"
                      >
                        <Star 
                          className={`h-4 w-4 ${
                            selectedThread.isStarred 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    </CardTitle>
                    <CardDescription>
                      {selectedThread.subject}
                      {selectedThread.studentName && (
                        <span className="ml-2">
                          • Öğrenci: {selectedThread.studentName}
                          {selectedThread.className && ` (${selectedThread.className})`}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRoleBadge(selectedThread.participantRole)}
                    {getPriorityBadge(selectedThread.priority)}
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {selectedThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderRole === 'teacher' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderRole === 'teacher'
                            ? 'bg-blue-500 text-white'
                            : message.priority === 'urgent' 
                              ? 'bg-red-50 border border-red-200 text-gray-900'
                              : message.priority === 'high'
                                ? 'bg-orange-50 border border-orange-200 text-gray-900'
                                : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.senderRole !== 'teacher' && (
                          <div className="text-xs font-medium mb-1">
                            {message.senderName}
                          </div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div
                            className={`text-xs ${
                              message.senderRole === 'teacher'
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatTimestamp(message.timestamp)}
                          </div>
                          {message.senderRole === 'teacher' && (
                            <div className="ml-2">
                              {message.isRead ? (
                                <CheckCircle className="h-3 w-3 text-blue-100" />
                              ) : (
                                <Circle className="h-3 w-3 text-blue-200" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Mesajınızı yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[700px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="mx-auto h-12 w-12 mb-4" />
                <p>Mesajlaşmaya başlamak için bir konuşma seçin</p>
                <p className="text-sm mt-2">
                  Toplam {totalUnreadCount} okunmamış mesajınız var
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherMessagingPage() {
  return (
    <TeacherGuard
      fallback={
        <AccessDenied
          title="Öğretmen Girişi Gerekli"
          message="Bu sayfayı görüntülemek için öğretmen hesabı ile giriş yapmalısınız."
        />
      }
      redirectTo="/auth/giris"
    >
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
        <TeacherMessagingContent />
      </Suspense>
    </TeacherGuard>
  );
}