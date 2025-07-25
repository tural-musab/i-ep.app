'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { ParentGuard } from '@/components/auth/role-guard';
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
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

// Message data types
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher' | 'admin';
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
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
  participantRole: 'teacher' | 'admin';
  subject: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
  studentName?: string; // For context about which student
}

// Demo messaging data for Turkish education system
const DEMO_MESSAGE_THREADS: MessageThread[] = [
  {
    id: '1',
    participantId: 'teacher-1',
    participantName: 'Ahmet Yılmaz',
    participantRole: 'teacher',
    subject: 'Matematik Dersi Hakkında',
    studentName: 'Ali Kaya',
    unreadCount: 2,
    lastMessage: {
      id: 'msg-5',
      senderId: 'teacher-1',
      senderName: 'Ahmet Yılmaz',
      senderRole: 'teacher',
      receiverId: 'parent-1',
      receiverName: 'Mehmet Kaya',
      content: 'Ali\'nin matematik dersindeki performansı son haftalarda oldukça iyi. Ödevlerini düzenli yapıyor ve derse aktif katılım gösteriyor.',
      timestamp: '2025-01-25T14:30:00Z',
      isRead: false
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
        isRead: true
      },
      {
        id: 'msg-2',
        senderId: 'teacher-1',
        senderName: 'Ahmet Yılmaz',
        senderRole: 'teacher',
        receiverId: 'parent-1',
        receiverName: 'Mehmet Kaya',
        content: 'Merhaba Mehmet Bey, tabii ki. Ali genel olarak başarılı bir öğrenci.',
        timestamp: '2025-01-25T11:20:00Z',
        isRead: true
      },
      {
        id: 'msg-3',
        senderId: 'parent-1',
        senderName: 'Mehmet Kaya',
        senderRole: 'parent',
        receiverId: 'teacher-1',
        receiverName: 'Ahmet Yılmaz',
        content: 'Evde matematik konularında nasıl destekleyebilirim?',
        timestamp: '2025-01-25T12:45:00Z',
        isRead: true
      },
      {
        id: 'msg-4',
        senderId: 'teacher-1',
        senderName: 'Ahmet Yılmaz',
        senderRole: 'teacher',
        receiverId: 'parent-1',
        receiverName: 'Mehmet Kaya',
        content: 'Günlük 30 dakika problem çözme pratik yapabilir. Ben de extra sorular gönderebilirim.',
        timestamp: '2025-01-25T13:10:00Z',
        isRead: true
      },
      {
        id: 'msg-5',
        senderId: 'teacher-1',
        senderName: 'Ahmet Yılmaz',
        senderRole: 'teacher',
        receiverId: 'parent-1',
        receiverName: 'Mehmet Kaya',
        content: 'Ali\'nin matematik dersindeki performansı son haftalarda oldukça iyi. Ödevlerini düzenli yapıyor ve derse aktif katılım gösteriyor.',
        timestamp: '2025-01-25T14:30:00Z',
        isRead: false
      }
    ]
  },
  {
    id: '2',
    participantId: 'teacher-2',
    participantName: 'Ayşe Demir',
    participantRole: 'teacher',
    subject: 'Fizik Laboratuvarı',
    studentName: 'Ali Kaya',
    unreadCount: 0,
    lastMessage: {
      id: 'msg-8',
      senderId: 'parent-1',
      senderName: 'Mehmet Kaya',
      senderRole: 'parent',
      receiverId: 'teacher-2',
      receiverName: 'Ayşe Demir',
      content: 'Teşekkür ederim Ayşe Hanım, Ali\'ye söyleyeceğim.',
      timestamp: '2025-01-24T16:45:00Z',
      isRead: true
    },
    messages: [
      {
        id: 'msg-6',
        senderId: 'teacher-2',
        senderName: 'Ayşe Demir',
        senderRole: 'teacher',
        receiverId: 'parent-1',
        receiverName: 'Mehmet Kaya',
        content: 'Merhaba, Ali\'nin laboratuvar malzemelerini getirmesi gerekiyor.',
        timestamp: '2025-01-24T15:20:00Z',
        isRead: true
      },
      {
        id: 'msg-7',
        senderId: 'parent-1',
        senderName: 'Mehmet Kaya',
        senderRole: 'parent',
        receiverId: 'teacher-2',
        receiverName: 'Ayşe Demir',
        content: 'Hangi malzemeler gerekli? Liste gönderebilir misiniz?',
        timestamp: '2025-01-24T16:10:00Z',
        isRead: true
      },
      {
        id: 'msg-8',
        senderId: 'parent-1',
        senderName: 'Mehmet Kaya',
        senderRole: 'parent',
        receiverId: 'teacher-2',
        receiverName: 'Ayşe Demir',
        content: 'Teşekkür ederim Ayşe Hanım, Ali\'ye söyleyeceğim.',
        timestamp: '2025-01-24T16:45:00Z',
        isRead: true
      }
    ]
  },
  {
    id: '3',
    participantId: 'admin-1',
    participantName: 'Fatma Özkan',
    participantRole: 'admin',
    subject: 'Okul Etkinlikleri',
    studentName: 'Ali Kaya',
    unreadCount: 1,
    lastMessage: {
      id: 'msg-10',
      senderId: 'admin-1',
      senderName: 'Fatma Özkan',
      senderRole: 'admin',
      receiverId: 'parent-1',
      receiverName: 'Mehmet Kaya',
      content: 'Okul bahçesinde düzenlenecek bilim fuarı için gönüllü veli arayışımız var. Katılım sağlayabilir misiniz?',
      timestamp: '2025-01-23T09:30:00Z',
      isRead: false
    },
    messages: [
      {
        id: 'msg-9',
        senderId: 'admin-1',
        senderName: 'Fatma Özkan',
        senderRole: 'admin',
        receiverId: 'parent-1',
        receiverName: 'Mehmet Kaya',
        content: 'Değerli velimiz, 15 Şubat\'ta düzenlenecek bilim fuarı hakkında bilgilendirme.',
        timestamp: '2025-01-23T09:15:00Z',
        isRead: true
      },
      {
        id: 'msg-10',
        senderId: 'admin-1',
        senderName: 'Fatma Özkan',
        senderRole: 'admin',
        receiverId: 'parent-1',
        receiverName: 'Mehmet Kaya',
        content: 'Okul bahçesinde düzenlenecek bilim fuarı için gönüllü veli arayışımız var. Katılım sağlayabilir misiniz?',
        timestamp: '2025-01-23T09:30:00Z',
        isRead: false
      }
    ]
  }
];

function ParentMessagingContent() {
  const { user } = useAuth();
  const { client: wsClient, isConnected, sendMessage: wsSendMessage } = useWebSocket();
  const { notifyNewMessage } = useMessageNotifications();
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  // Load message threads
  useEffect(() => {
    async function loadMessageThreads() {
      setIsLoading(true);
      try {
        // TODO: Replace with real API call
        // const response = await fetch('/api/messages/threads');
        // const result = await response.json();
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        setMessageThreads(DEMO_MESSAGE_THREADS);
      } catch (error) {
        console.error('Error loading message threads:', error);
        setMessageThreads(DEMO_MESSAGE_THREADS);
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
                isRead: false
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
    wsClient.on('*', handleNewMessage); // Fallback for all message types

    return () => {
      wsClient.off('new_message', handleNewMessage);
      wsClient.off('*', handleNewMessage);
    };
  }, [wsClient, selectedThread, notifyNewMessage]);

  // Filter threads based on search
  const filteredThreads = messageThreads.filter(thread => 
    thread.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (thread.studentName && thread.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        senderId: user?.id || 'parent-1',
        senderName: user?.profile?.fullName || 'Mehmet Kaya',
        senderRole: 'parent',
        receiverId: selectedThread.participantId,
        receiverName: selectedThread.participantName,
        content: newMessage,
        timestamp: new Date().toISOString(),
        isRead: false
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

  // Mark thread as read
  const markThreadAsRead = (thread: MessageThread) => {
    if (thread.unreadCount > 0) {
      const updatedThread = { ...thread, unreadCount: 0 };
      setMessageThreads(prev => 
        prev.map(t => t.id === thread.id ? updatedThread : t)
      );
      setSelectedThread(updatedThread);
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'teacher':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Öğretmen</Badge>;
      case 'admin':
        return <Badge variant="outline" className="border-red-500 text-red-600">Yönetici</Badge>;
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
            <Link href="/veli">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Veli Paneli'ne Dön
            </Link>
          </Button>
        </div>
        
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
          Öğretmenler ve okul yönetimiyle gerçek zamanlı iletişim kurun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Threads List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Konuşmalar
                </CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni
                </Button>
              </div>
              <CardDescription>
                {filteredThreads.length} konuşma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Öğretmen veya konu ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Thread List */}
              <div className="space-y-2">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setSelectedThread(thread);
                      markThreadAsRead(thread);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-sm">{thread.participantName}</div>
                        {getRoleBadge(thread.participantRole)}
                      </div>
                      {thread.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{thread.subject}</div>
                    {thread.studentName && (
                      <div className="text-xs text-gray-500 mb-1">
                        Öğrenci: {thread.studentName}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {thread.lastMessage.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
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
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      {selectedThread.participantName}
                    </CardTitle>
                    <CardDescription>
                      {selectedThread.subject}
                      {selectedThread.studentName && ` • Öğrenci: ${selectedThread.studentName}`}
                    </CardDescription>
                  </div>
                  {getRoleBadge(selectedThread.participantRole)}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {selectedThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderRole === 'parent' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderRole === 'parent'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div
                            className={`text-xs ${
                              message.senderRole === 'parent'
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatTimestamp(message.timestamp)}
                          </div>
                          {message.senderRole === 'parent' && (
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
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="mx-auto h-12 w-12 mb-4" />
                <p>Mesajlaşmaya başlamak için bir konuşma seçin</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ParentMessagingPage() {
  return (
    <ParentGuard
      fallback={
        <AccessDenied
          title="Veli Girişi Gerekli"
          message="Bu sayfayı görüntülemek için veli hesabı ile giriş yapmalısınız."
        />
      }
      redirectTo="/auth/giris"
    >
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
        <ParentMessagingContent />
      </Suspense>
    </ParentGuard>
  );
}