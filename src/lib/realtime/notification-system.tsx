/**
 * Real-time Notification System for İ-EP.APP
 * Handles in-app notifications and real-time updates
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

export interface Notification {
  id: string;
  type: 'message' | 'assignment' | 'grade' | 'attendance' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    senderId?: string;
    senderName?: string;
    threadId?: string;
    assignmentId?: string;
    gradeId?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  getNotificationsByType: (type: Notification['type']) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Demo notifications for Turkish education system
  useEffect(() => {
    if (user?.role) {
      loadDemoNotifications(user.role);
    }
  }, [user?.role]);

  const loadDemoNotifications = (userRole: string) => {
    const demoNotifications: Notification[] = [];

    if (userRole === 'parent') {
      demoNotifications.push(
        {
          id: 'notif-1',
          type: 'message',
          title: 'Öğretmenden Yeni Mesaj',
          message: 'Ahmet Yılmaz: Ali\'nin matematik dersindeki performansı hakkında...',
          priority: 'high',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          isRead: false,
          actionUrl: '/veli/mesajlar',
          metadata: {
            senderId: 'teacher-1',
            senderName: 'Ahmet Yılmaz',
            threadId: 'thread-1'
          }
        },
        {
          id: 'notif-2',
          type: 'grade',
          title: 'Yeni Not Girişi',
          message: 'Ali Kaya - Matematik Sınavı: 85 (AA)',
          priority: 'normal',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          isRead: false,
          actionUrl: '/veli/notlar',
          metadata: {
            gradeId: 'grade-1'
          }
        },
        {
          id: 'notif-3',
          type: 'attendance',
          title: 'Devamsızlık Bildirimi',
          message: 'Ali Kaya bugün matematik dersinde bulunmadı',
          priority: 'urgent',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          isRead: true,
          actionUrl: '/veli/devamsizlik'
        }
      );
    }

    if (userRole === 'teacher') {
      demoNotifications.push(
        {
          id: 'notif-4',
          type: 'message',
          title: 'Veliden Yeni Mesaj',
          message: 'Mehmet Kaya: Emre\'nin ders durumu hakkında bilgi almak istiyorum',
          priority: 'normal',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/ogretmen/mesajlar',
          metadata: {
            senderId: 'parent-1',
            senderName: 'Mehmet Kaya',
            threadId: 'thread-2'
          }
        },
        {
          id: 'notif-5',
          type: 'assignment',
          title: 'Ödev Teslimi',
          message: '5 öğrenci matematik ödevini teslim etti',
          priority: 'normal',
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/ogretmen/odevler',
          metadata: {
            assignmentId: 'assignment-1'
          }
        }
      );
    }

    if (userRole === 'admin') {
      demoNotifications.push(
        {
          id: 'notif-6',
          type: 'system',
          title: 'Sistem Performans Uyarısı',
          message: 'API yanıt süresi son 1 saatte ortalama 450ms',
          priority: 'high',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/admin/sistem'
        },
        {
          id: 'notif-7',
          type: 'system',
          title: 'Yeni Kullanıcı Kaydı',
          message: '3 yeni kullanıcı sisteme kaydoldu',
          priority: 'normal',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          isRead: true,
          actionUrl: '/admin/kullanicilar'
        }
      );
    }

    if (userRole === 'student') {
      demoNotifications.push(
        {
          id: 'notif-8',
          type: 'grade',
          title: 'Yeni Notunuz',
          message: 'Matematik Sınavı notunuz: 85 (AA)',
          priority: 'normal',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/ogrenci/notlar'
        },
        {
          id: 'notif-9',
          type: 'assignment',
          title: 'Yeni Ödev',
          message: 'Matematik - Türev Problemleri (Son teslim: 3 gün)',
          priority: 'high',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/ogrenci/odevler'
        }
      );
    }

    setNotifications(demoNotifications);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      });
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(notif => notif.type === type);
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook for real-time messaging notifications
export function useMessageNotifications() {
  const { addNotification } = useNotifications();

  const notifyNewMessage = (threadId: string, senderName: string, content: string, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal') => {
    addNotification({
      type: 'message',
      title: 'Yeni Mesaj',
      message: `${senderName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      priority,
      actionUrl: '/veli/mesajlar', // Will be dynamic based on user role
      metadata: {
        threadId,
        senderName
      }
    });
  };

  const notifyMessageRead = (threadId: string) => {
    // Could add read receipt notifications here
  };

  return {
    notifyNewMessage,
    notifyMessageRead
  };
}

// Utility functions for notification formatting
export const formatNotificationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Şimdi';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'message': return '💬';
    case 'assignment': return '📝';
    case 'grade': return '📊';
    case 'attendance': return '📅';
    case 'system': return '⚙️';
    default: return '🔔';
  }
};

export const getPriorityColor = (priority: Notification['priority']): string => {
  switch (priority) {
    case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};