/**
 * Parent Communication Data Hook
 * Phase 6.1: Frontend-Backend Integration
 * İ-EP.APP - Veli İletişim Verileri Hook'u
 */

'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api/api-client';

interface CommunicationStats {
  totalParents: number;
  activeConversations: number;
  unreadMessages: number;
  pendingMeetings: number;
  newNotifications: number;
  feedbackCount: number;
  responseRate: number;
  averageResponseTime: number;
  satisfactionRating: number;
  monthlyTrend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface RecentActivity {
  id: string;
  type: 'message' | 'meeting' | 'notification' | 'feedback';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  priority: 'high' | 'medium' | 'low' | 'info' | 'positive';
  parentName?: string;
  studentName?: string;
  count?: number;
  rating?: number;
}

interface UpcomingMeeting {
  id: string;
  parent: string;
  student: string;
  teacher: string;
  subject: string;
  date: string;
  duration: number;
  type: 'individual' | 'urgent' | 'group';
  mode: 'online' | 'in_person' | 'phone';
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface TopParent {
  name: string;
  student: string;
  totalMessages: number;
  totalMeetings: number;
  responseRate: number;
  engagementScore: number;
  trend: 'up' | 'down' | 'stable';
}

interface CommunicationChannel {
  channel: string;
  usage: number;
  preference: number;
  responseTime: number;
  color: string;
}

interface PendingAction {
  id: string;
  type: 'message' | 'meeting' | 'notification' | 'feedback';
  title: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
  action: string;
  color: string;
}

interface ParentCommunicationData {
  communicationStats: CommunicationStats;
  recentActivity: RecentActivity[];
  upcomingMeetings: UpcomingMeeting[];
  topParents: TopParent[];
  communicationChannels: CommunicationChannel[];
  pendingActions: PendingAction[];
  isLoading: boolean;
  error: string | null;
  isUsingMockData: boolean;
}

// Mock data - will be replaced with API calls
const mockCommunicationStats: CommunicationStats = {
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

const mockRecentActivity: RecentActivity[] = [
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

const mockUpcomingMeetings: UpcomingMeeting[] = [
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

const mockTopParents: TopParent[] = [
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

const mockCommunicationChannels: CommunicationChannel[] = [
  {
    channel: 'Uygulama Mesajları',
    usage: 78,
    preference: 85,
    responseTime: 1.2,
    color: 'bg-blue-100 text-blue-800',
  },
  {
    channel: 'E-posta',
    usage: 65,
    preference: 72,
    responseTime: 4.5,
    color: 'bg-green-100 text-green-800',
  },
  {
    channel: 'SMS',
    usage: 42,
    preference: 58,
    responseTime: 0.8,
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    channel: 'Telefon',
    usage: 25,
    preference: 45,
    responseTime: 0.1,
    color: 'bg-purple-100 text-purple-800',
  },
];

const mockPendingActions: PendingAction[] = [
  {
    id: '1',
    type: 'message',
    title: 'Okunmamış mesajlar',
    count: 28,
    priority: 'high',
    action: 'Yanıtla',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: '2',
    type: 'meeting',
    title: 'Onay bekleyen toplantılar',
    count: 12,
    priority: 'medium',
    action: 'Onayla',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: '3',
    type: 'notification',
    title: 'Bekleyen bildirimler',
    count: 8,
    priority: 'low',
    action: 'Gönder',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: '4',
    type: 'feedback',
    title: 'Yanıt bekleyen geri bildirimler',
    count: 5,
    priority: 'medium',
    action: 'Yanıtla',
    color: 'bg-green-100 text-green-800',
  },
];

export function useParentCommunicationData(): ParentCommunicationData {
  const [data, setData] = useState<ParentCommunicationData>({
    communicationStats: mockCommunicationStats,
    recentActivity: mockRecentActivity,
    upcomingMeetings: mockUpcomingMeetings,
    topParents: mockTopParents,
    communicationChannels: mockCommunicationChannels,
    pendingActions: mockPendingActions,
    isLoading: false,
    error: null,
    isUsingMockData: true,
  });

  useEffect(() => {
    const fetchParentCommunicationData = async () => {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Try to fetch real API data
        const [statsResponse, activityResponse, meetingsResponse] = await Promise.all([
          fetch('/api/parent-communication/statistics').catch(() => null),
          fetch('/api/parent-communication/activity').catch(() => null),
          fetch('/api/parent-communication/meetings').catch(() => null),
        ]);

        let hasRealData = false;
        const newData: Partial<ParentCommunicationData> = {};

        // Process statistics API response
        if (statsResponse && statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData && !statsData.error) {
            newData.communicationStats = {
              totalParents: statsData.totalParents || 0,
              activeConversations: statsData.activeConversations || 0,
              unreadMessages: statsData.unreadMessages || 0,
              pendingMeetings: statsData.pendingMeetings || 0,
              newNotifications: statsData.newNotifications || 0,
              feedbackCount: statsData.feedbackCount || 0,
              responseRate: statsData.responseRate || 0,
              averageResponseTime: statsData.averageResponseTime || 0,
              satisfactionRating: statsData.satisfactionRating || 0,
              monthlyTrend: statsData.monthlyTrend || 'stable',
              trendValue: statsData.trendValue || 0,
            };
            hasRealData = true;
          }
        }

        // Process activity API response
        if (activityResponse && activityResponse.ok) {
          const activityData = await activityResponse.json();
          if (activityData && activityData.data && Array.isArray(activityData.data)) {
            newData.recentActivity = activityData.data.map((item: any) => ({
              id: item.id,
              type: item.type,
              title: item.title,
              description: item.description,
              timestamp: item.timestamp || item.created_at,
              status: item.status,
              priority: item.priority || 'medium',
              parentName: item.parentName,
              studentName: item.studentName,
              count: item.count,
              rating: item.rating,
            }));
            hasRealData = true;
          }
        }

        // Process meetings API response
        if (meetingsResponse && meetingsResponse.ok) {
          const meetingsData = await meetingsResponse.json();
          if (meetingsData && meetingsData.data && Array.isArray(meetingsData.data)) {
            newData.upcomingMeetings = meetingsData.data.map((item: any) => ({
              id: item.id,
              parent: item.parent_name,
              student: item.student_name,
              teacher: item.teacher_name,
              subject: item.subject,
              date: item.scheduled_date || item.date,
              duration: item.duration || 30,
              type: item.type || 'individual',
              mode: item.mode || 'in_person',
              status: item.status || 'pending',
            }));
            hasRealData = true;
          }
        }

        // Update data with real API data or keep mock data
        setData((prev) => ({
          ...prev,
          ...newData,
          isLoading: false,
          isUsingMockData: !hasRealData,
          error: null,
        }));

        console.log(
          'Parent communication data updated:',
          hasRealData ? 'Real API data' : 'Mock data fallback'
        );
      } catch (error) {
        console.error('Error fetching parent communication data:', error);
        setData((prev) => ({
          ...prev,
          isLoading: false,
          isUsingMockData: true,
          error: 'Failed to fetch parent communication data',
        }));
      }
    };

    fetchParentCommunicationData();
  }, []);

  return data;
}
