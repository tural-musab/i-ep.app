/**
 * Parent Communication Repository
 * Sprint 6: Parent Communication Portal Development
 * İ-EP.APP - Veli İletişim Repository
 */

import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface ParentMessage {
  id: string;
  tenant_id: string;
  parent_id: string;
  teacher_id: string;
  student_id: string;
  subject: string;
  message: string;
  message_type: 'inquiry' | 'concern' | 'compliment' | 'meeting_request' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'archived';
  reply_to?: string;
  attachments?: string[];
  is_anonymous: boolean;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
  read_at?: string;
  replied_at?: string;
}

export interface ParentMeeting {
  id: string;
  tenant_id: string;
  parent_id: string;
  teacher_id: string;
  student_id: string;
  meeting_type: 'individual' | 'group' | 'urgent' | 'routine';
  title: string;
  description?: string;
  meeting_date: string;
  duration: number;
  meeting_mode: 'in_person' | 'online' | 'phone';
  meeting_link?: string;
  meeting_room?: string;
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  agenda?: string[];
  notes?: string;
  action_items?: string[];
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
}

export interface ParentNotification {
  id: string;
  tenant_id: string;
  parent_id: string;
  student_id?: string;
  teacher_id?: string;
  notification_type:
    | 'academic'
    | 'behavioral'
    | 'attendance'
    | 'administrative'
    | 'event'
    | 'emergency';
  title: string;
  message: string;
  priority: 'info' | 'warning' | 'urgent' | 'critical';
  channel: 'app' | 'email' | 'sms' | 'push' | 'all';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  scheduled_for?: string;
  expires_at?: string;
  action_required: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  read_at?: string;
}

export interface ParentFeedback {
  id: string;
  tenant_id: string;
  parent_id: string;
  student_id?: string;
  teacher_id?: string;
  feedback_type:
    | 'teacher_performance'
    | 'school_service'
    | 'curriculum'
    | 'facility'
    | 'suggestion'
    | 'complaint';
  category: 'academic' | 'behavioral' | 'administrative' | 'facility' | 'communication' | 'other';
  rating: number;
  title: string;
  description: string;
  is_anonymous: boolean;
  status: 'submitted' | 'reviewed' | 'responded' | 'resolved' | 'escalated';
  response?: string;
  response_date?: string;
  escalated_to?: string;
  resolution_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ParentPortalAccess {
  id: string;
  tenant_id: string;
  parent_id: string;
  student_id: string;
  access_level: 'full' | 'limited' | 'view_only' | 'emergency_only';
  permissions: {
    view_grades: boolean;
    view_attendance: boolean;
    view_assignments: boolean;
    view_behavior: boolean;
    message_teachers: boolean;
    schedule_meetings: boolean;
    receive_notifications: boolean;
    submit_feedback: boolean;
  };
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
    quiet_hours: {
      start: string;
      end: string;
    };
  };
  emergency_contacts: string[];
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface CommunicationThread {
  id: string;
  tenant_id: string;
  parent_id: string;
  teacher_id: string;
  student_id: string;
  thread_type: 'individual' | 'group' | 'broadcast';
  participants: string[];
  subject: string;
  status: 'active' | 'closed' | 'archived';
  last_message_at: string;
  messages: ParentMessage[];
  created_at: string;
  updated_at: string;
}

export class ParentCommunicationRepository extends BaseRepository<ParentMessage> {
  constructor(supabase: SupabaseClient, tenantId: string) {
    super(supabase, 'parent_messages', tenantId);
  }

  // Message Management
  async createMessage(
    messageData: Omit<ParentMessage, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
  ): Promise<ParentMessage> {
    const { data, error } = await this.supabase
      .from('parent_messages')
      .insert({
        ...messageData,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMessagesByParent(
    parentId: string,
    status?: ParentMessage['status'],
    limit?: number
  ): Promise<ParentMessage[]> {
    let query = this.getBaseQuery()
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getMessagesByTeacher(
    teacherId: string,
    status?: ParentMessage['status'],
    limit?: number
  ): Promise<ParentMessage[]> {
    let query = this.getBaseQuery()
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getMessagesByStudent(studentId: string, limit?: number): Promise<ParentMessage[]> {
    let query = this.getBaseQuery()
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async markMessageAsRead(messageId: string): Promise<ParentMessage> {
    const { data, error } = await this.supabase
      .from('parent_messages')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async replyToMessage(
    messageId: string,
    replyData: Omit<ParentMessage, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'reply_to'>
  ): Promise<ParentMessage> {
    const { data, error } = await this.supabase
      .from('parent_messages')
      .insert({
        ...replyData,
        reply_to: messageId,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update original message status
    await this.supabase
      .from('parent_messages')
      .update({
        status: 'replied',
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('tenant_id', this.tenantId);

    return data;
  }

  // Meeting Management
  async createMeeting(
    meetingData: Omit<ParentMeeting, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
  ): Promise<ParentMeeting> {
    const { data, error } = await this.supabase
      .from('parent_meetings')
      .insert({
        ...meetingData,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMeetingsByParent(
    parentId: string,
    status?: ParentMeeting['status'],
    upcoming?: boolean
  ): Promise<ParentMeeting[]> {
    let query = this.supabase
      .from('parent_meetings')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('parent_id', parentId)
      .order('meeting_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (upcoming) {
      query = query.gte('meeting_date', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async confirmMeeting(meetingId: string): Promise<ParentMeeting> {
    const { data, error } = await this.supabase
      .from('parent_meetings')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async rescheduleMeeting(
    meetingId: string,
    newDate: string,
    newDuration?: number
  ): Promise<ParentMeeting> {
    const updateData: any = {
      meeting_date: newDate,
      status: 'rescheduled',
      updated_at: new Date().toISOString(),
    };

    if (newDuration) {
      updateData.duration = newDuration;
    }

    const { data, error } = await this.supabase
      .from('parent_meetings')
      .update(updateData)
      .eq('id', meetingId)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addMeetingNotes(
    meetingId: string,
    notes: string,
    actionItems?: string[]
  ): Promise<ParentMeeting> {
    const updateData: any = {
      notes,
      status: 'completed',
      updated_at: new Date().toISOString(),
    };

    if (actionItems) {
      updateData.action_items = actionItems;
    }

    const { data, error } = await this.supabase
      .from('parent_meetings')
      .update(updateData)
      .eq('id', meetingId)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Notification Management
  async createNotification(
    notificationData: Omit<ParentNotification, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
  ): Promise<ParentNotification> {
    const { data, error } = await this.supabase
      .from('parent_notifications')
      .insert({
        ...notificationData,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNotificationsByParent(
    parentId: string,
    status?: ParentNotification['status'],
    limit?: number
  ): Promise<ParentNotification[]> {
    let query = this.supabase
      .from('parent_notifications')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async markNotificationAsRead(notificationId: string): Promise<ParentNotification> {
    const { data, error } = await this.supabase
      .from('parent_notifications')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async sendBulkNotifications(
    parentIds: string[],
    notificationData: Omit<
      ParentNotification,
      'id' | 'tenant_id' | 'parent_id' | 'created_at' | 'updated_at'
    >
  ): Promise<ParentNotification[]> {
    const notifications = parentIds.map((parentId) => ({
      ...notificationData,
      parent_id: parentId,
      tenant_id: this.tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await this.supabase
      .from('parent_notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    return data || [];
  }

  // Feedback Management
  async createFeedback(
    feedbackData: Omit<ParentFeedback, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
  ): Promise<ParentFeedback> {
    const { data, error } = await this.supabase
      .from('parent_feedback')
      .insert({
        ...feedbackData,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFeedbackByParent(
    parentId: string,
    status?: ParentFeedback['status']
  ): Promise<ParentFeedback[]> {
    let query = this.supabase
      .from('parent_feedback')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async respondToFeedback(
    feedbackId: string,
    response: string,
    responderId: string
  ): Promise<ParentFeedback> {
    const { data, error } = await this.supabase
      .from('parent_feedback')
      .update({
        response,
        response_date: new Date().toISOString(),
        status: 'responded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Portal Access Management
  async createPortalAccess(
    accessData: Omit<ParentPortalAccess, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
  ): Promise<ParentPortalAccess> {
    const { data, error } = await this.supabase
      .from('parent_portal_access')
      .insert({
        ...accessData,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPortalAccessByParent(parentId: string): Promise<ParentPortalAccess[]> {
    const { data, error } = await this.supabase
      .from('parent_portal_access')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('parent_id', parentId);

    if (error) throw error;
    return data || [];
  }

  async updateNotificationPreferences(
    parentId: string,
    preferences: ParentPortalAccess['notification_preferences']
  ): Promise<ParentPortalAccess> {
    const { data, error } = await this.supabase
      .from('parent_portal_access')
      .update({
        notification_preferences: preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('parent_id', parentId)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLastLogin(parentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('parent_portal_access')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('parent_id', parentId)
      .eq('tenant_id', this.tenantId);

    if (error) throw error;
  }

  // Communication Thread Management
  async createThread(
    threadData: Omit<
      CommunicationThread,
      'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'messages'
    >
  ): Promise<CommunicationThread> {
    const { data, error } = await this.supabase
      .from('communication_threads')
      .insert({
        ...threadData,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getThreadsByParent(
    parentId: string,
    status?: CommunicationThread['status']
  ): Promise<CommunicationThread[]> {
    let query = this.supabase
      .from('communication_threads')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('parent_id', parentId)
      .order('last_message_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Analytics and Reporting
  async getParentEngagementStats(parentId: string): Promise<{
    totalMessages: number;
    totalMeetings: number;
    totalNotifications: number;
    lastActivity: string;
    responseRate: number;
    averageResponseTime: number;
  }> {
    const [messagesCount, meetingsCount, notificationsCount] = await Promise.all([
      this.getMessagesByParent(parentId),
      this.getMeetingsByParent(parentId),
      this.getNotificationsByParent(parentId),
    ]);

    const totalMessages = messagesCount.length;
    const totalMeetings = meetingsCount.length;
    const totalNotifications = notificationsCount.length;

    const lastActivity = Math.max(
      ...messagesCount.map((m) => new Date(m.created_at).getTime()),
      ...meetingsCount.map((m) => new Date(m.created_at).getTime()),
      ...notificationsCount.map((n) => new Date(n.created_at).getTime())
    );

    const repliedMessages = messagesCount.filter((m) => m.status === 'replied');
    const responseRate = totalMessages > 0 ? (repliedMessages.length / totalMessages) * 100 : 0;

    const responseTimes = repliedMessages
      .filter((m) => m.replied_at)
      .map((m) => new Date(m.replied_at!).getTime() - new Date(m.created_at).getTime());

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

    return {
      totalMessages,
      totalMeetings,
      totalNotifications,
      lastActivity: new Date(lastActivity).toISOString(),
      responseRate,
      averageResponseTime: averageResponseTime / (1000 * 60 * 60), // Convert to hours
    };
  }

  async getTeacherCommunicationStats(teacherId: string): Promise<{
    totalMessages: number;
    totalMeetings: number;
    uniqueParents: number;
    averageResponseTime: number;
    satisfactionRating: number;
  }> {
    const [messages, meetings, feedback] = await Promise.all([
      this.getMessagesByTeacher(teacherId),
      this.supabase
        .from('parent_meetings')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('teacher_id', teacherId),
      this.supabase
        .from('parent_feedback')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('teacher_id', teacherId),
    ]);

    const totalMessages = messages.length;
    const totalMeetings = meetings.data?.length || 0;
    const uniqueParents = new Set([
      ...messages.map((m) => m.parent_id),
      ...(meetings.data || []).map((m) => m.parent_id),
    ]).size;

    const responseTimes = messages
      .filter((m) => m.replied_at)
      .map((m) => new Date(m.replied_at!).getTime() - new Date(m.created_at).getTime());

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

    const ratings = feedback.data?.map((f) => f.rating) || [];
    const satisfactionRating =
      ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    return {
      totalMessages,
      totalMeetings,
      uniqueParents,
      averageResponseTime: averageResponseTime / (1000 * 60 * 60), // Convert to hours
      satisfactionRating,
    };
  }
}
