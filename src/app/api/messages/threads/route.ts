import { NextRequest, NextResponse } from 'next/server';
import { verifyTenantAccess } from '@/lib/auth/tenant-auth';

// Message thread types
interface MessageThread {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'parent' | 'teacher' | 'admin' | 'student';
  subject: string;
  lastMessageId: string;
  lastMessageContent: string;
  lastMessageTimestamp: string;
  lastMessageSenderId: string;
  unreadCount: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isStarred: boolean;
  studentId?: string;
  studentName?: string;
  className?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Demo message threads data
const DEMO_MESSAGE_THREADS: MessageThread[] = [
  {
    id: 'thread-1',
    participantId: 'parent-1',
    participantName: 'Mehmet Kaya',
    participantRole: 'parent',
    subject: 'Ali\'nin Matematik Performansı',
    lastMessageId: 'msg-5',
    lastMessageContent: 'Ali\'nin matematik dersindeki performansı son haftalarda oldukça iyi. Ödevlerini düzenli yapıyor ve derse aktif katılım gösteriyor.',
    lastMessageTimestamp: '2025-01-25T14:30:00Z',
    lastMessageSenderId: 'teacher-1',
    unreadCount: 2,
    priority: 'normal',
    isStarred: true,
    studentId: 'student-1',
    studentName: 'Ali Kaya',
    className: '10-A',
    tenantId: 'demo-tenant',
    createdAt: '2025-01-25T10:15:00Z',
    updatedAt: '2025-01-25T14:30:00Z'
  },
  {
    id: 'thread-2',
    participantId: 'parent-2',
    participantName: 'Fatma Çelik',
    participantRole: 'parent',
    subject: 'Emre\'nin Devamsızlık Durumu',
    lastMessageId: 'msg-9',
    lastMessageContent: 'Anlıyorum, bu durumda ne yapmamız gerekiyor?',
    lastMessageTimestamp: '2025-01-25T13:20:00Z',
    lastMessageSenderId: 'parent-2',
    unreadCount: 2,
    priority: 'high',
    isStarred: false,
    studentId: 'student-2',
    studentName: 'Emre Çelik',
    className: '10-A',
    tenantId: 'demo-tenant',
    createdAt: '2025-01-25T12:00:00Z',
    updatedAt: '2025-01-25T13:20:00Z'
  },
  {
    id: 'thread-3',
    participantId: 'admin-1',
    participantName: 'Mehmet Yılmaz',
    participantRole: 'admin',
    subject: 'Dönem Sonu Toplantısı',
    lastMessageId: 'msg-12',
    lastMessageContent: 'Toplantı Pazartesi 14:00\'te. Not girişleri için son tarih Cuma.',
    lastMessageTimestamp: '2025-01-25T11:00:00Z',
    lastMessageSenderId: 'admin-1',
    unreadCount: 1,
    priority: 'urgent',
    isStarred: true,
    tenantId: 'demo-tenant',
    createdAt: '2025-01-25T10:30:00Z',
    updatedAt: '2025-01-25T11:00:00Z'
  },
  {
    id: 'thread-4',
    participantId: 'student-1',
    participantName: 'Zeynep Şahin',
    participantRole: 'student',
    subject: 'Matematik Ek Ders Talebi',
    lastMessageId: 'msg-15',
    lastMessageContent: 'Elbette Zeynep, Çarşamba öğleden sonra müsaitim. 15:00-16:00 arası uygun mu?',
    lastMessageTimestamp: '2025-01-24T16:30:00Z',
    lastMessageSenderId: 'teacher-1',
    unreadCount: 0,
    priority: 'normal',
    isStarred: false,
    studentName: 'Zeynep Şahin',
    className: '11-B',
    tenantId: 'demo-tenant',
    createdAt: '2025-01-24T15:45:00Z',
    updatedAt: '2025-01-24T16:30:00Z'
  }
];

// GET /api/messages/threads - Get message threads for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'teacher'; // teacher, parent, admin, student
    const userId = searchParams.get('userId') || 'teacher-1'; // Demo fallback
    const includeRead = searchParams.get('includeRead') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Verify tenant access
    const tenantCheck = await verifyTenantAccess(request);
    if ('error' in tenantCheck) {
      return NextResponse.json(tenantCheck, { status: 401 });
    }

    // TODO: Replace with real database query
    // const { data: threads, error, count } = await supabase
    //   .from('message_threads')
    //   .select(`
    //     *,
    //     participant:participant_id(id, full_name, role),
    //     student:student_id(id, full_name, class_name),
    //     last_message:last_message_id(id, content, timestamp, sender_id)
    //   `)
    //   .eq('tenant_id', tenantCheck.tenant.id)
    //   .or(`participant_id.eq.${userId},created_by.eq.${userId}`)
    //   .order('updated_at', { ascending: false })
    //   .range(offset, offset + limit - 1);

    // Filter demo threads based on user role and ID
    let filteredThreads = DEMO_MESSAGE_THREADS.filter(thread => {
      // Check tenant
      if (thread.tenantId !== tenantCheck.tenant.id) return false;
      
      // Check if user is participant
      const isParticipant = thread.participantId === userId;
      
      // For teacher role, show all threads where they are involved
      if (role === 'teacher') {
        return isParticipant || thread.participantRole !== 'teacher';
      }
      
      // For parent role, show threads where they are the participant
      if (role === 'parent') {
        return thread.participantRole === 'parent' && isParticipant;
      }
      
      // For admin role, show all threads
      if (role === 'admin') {
        return true;
      }
      
      // For student role, show threads where they are the participant
      if (role === 'student') {
        return thread.participantRole === 'student' && isParticipant;
      }
      
      return isParticipant;
    });

    // Apply read filter
    if (!includeRead) {
      filteredThreads = filteredThreads.filter(thread => thread.unreadCount > 0);
    }

    // Apply pagination
    const paginatedThreads = filteredThreads.slice(offset, offset + limit);

    // Calculate statistics
    const stats = {
      totalThreads: filteredThreads.length,
      unreadThreads: filteredThreads.filter(t => t.unreadCount > 0).length,
      totalUnreadMessages: filteredThreads.reduce((sum, t) => sum + t.unreadCount, 0),
      priorityBreakdown: {
        urgent: filteredThreads.filter(t => t.priority === 'urgent').length,
        high: filteredThreads.filter(t => t.priority === 'high').length,
        normal: filteredThreads.filter(t => t.priority === 'normal').length,
        low: filteredThreads.filter(t => t.priority === 'low').length
      },
      roleBreakdown: {
        parent: filteredThreads.filter(t => t.participantRole === 'parent').length,
        teacher: filteredThreads.filter(t => t.participantRole === 'teacher').length,
        admin: filteredThreads.filter(t => t.participantRole === 'admin').length,
        student: filteredThreads.filter(t => t.participantRole === 'student').length
      }
    };

    return NextResponse.json({
      success: true,
      data: paginatedThreads,
      stats,
      pagination: {
        total: filteredThreads.length,
        limit,
        offset,
        hasMore: offset + limit < filteredThreads.length
      }
    });

  } catch (error) {
    console.error('Error fetching message threads:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Mesaj konuşmaları yüklenirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// POST /api/messages/threads - Create new message thread
export async function POST(request: NextRequest) {
  try {
    // Verify tenant access
    const tenantCheck = await verifyTenantAccess(request);
    if ('error' in tenantCheck) {
      return NextResponse.json(tenantCheck, { status: 401 });
    }

    const {
      participantId,
      subject,
      initialMessage,
      priority = 'normal',
      studentId
    } = await request.json();
    
    // Validate required fields
    if (!participantId || !subject || !initialMessage) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Eksik bilgi: Alıcı, konu ve mesaj içeriği gerekli' 
        },
        { status: 400 }
      );
    }

    // Demo user ID (in real app, get from session)
    const creatorId = 'teacher-1';
    
    // TODO: Get participant and student info from database
    // const { data: participant } = await supabase
    //   .from('users')
    //   .select('id, full_name, role')
    //   .eq('id', participantId)
    //   .single();

    // const { data: student } = studentId ? await supabase
    //   .from('students')
    //   .select('id, full_name, class_name')
    //   .eq('id', studentId)
    //   .single() : { data: null };

    // Generate new thread
    const newThreadId = `thread-${Date.now()}`;
    const newThread: MessageThread = {
      id: newThreadId,
      participantId,
      participantName: 'Yeni Katılımcı', // This would come from database
      participantRole: 'parent', // This would come from database
      subject,
      lastMessageId: `msg-${Date.now()}`,
      lastMessageContent: initialMessage,
      lastMessageTimestamp: new Date().toISOString(),
      lastMessageSenderId: creatorId,
      unreadCount: 1,
      priority,
      isStarred: false,
      studentId,
      studentName: studentId ? 'Öğrenci Adı' : undefined, // This would come from database
      className: studentId ? '10-A' : undefined, // This would come from database
      tenantId: tenantCheck.tenant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Replace with real database transaction
    // const { data: insertedThread, error } = await supabase
    //   .from('message_threads')
    //   .insert({
    //     participant_id: participantId,
    //     subject,
    //     priority,
    //     student_id: studentId,
    //     tenant_id: tenantCheck.tenant.id,
    //     created_by: creatorId
    //   })
    //   .select()
    //   .single();

    // Also create the initial message
    // const { data: initialMsg, error: msgError } = await supabase
    //   .from('messages')
    //   .insert({
    //     thread_id: insertedThread.id,
    //     sender_id: creatorId,
    //     receiver_id: participantId,
    //     content: initialMessage,
    //     subject,
    //     priority,
    //     student_id: studentId,
    //     tenant_id: tenantCheck.tenant.id
    //   })
    //   .select()
    //   .single();

    // For demo, add to our demo array
    DEMO_MESSAGE_THREADS.unshift(newThread);

    // TODO: Send real-time notification
    // await sendRealtimeNotification(participantId, {
    //   type: 'new_thread',
    //   data: newThread
    // });

    return NextResponse.json({
      success: true,
      data: newThread,
      message: 'Yeni konuşma başlatıldı'
    });

  } catch (error) {
    console.error('Error creating message thread:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Konuşma oluşturulurken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// PUT /api/messages/threads - Update thread (star/unstar, mark as read, etc.)
export async function PUT(request: NextRequest) {
  try {
    // Verify tenant access
    const tenantCheck = await verifyTenantAccess(request);
    if ('error' in tenantCheck) {
      return NextResponse.json(tenantCheck, { status: 401 });
    }

    const { threadId, action, value } = await request.json();
    const userId = 'teacher-1'; // This would come from authenticated session

    if (!threadId || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Thread ID ve işlem türü gerekli' 
        },
        { status: 400 }
      );
    }

    // TODO: Replace with real database update
    // let updateData: any = {};
    // 
    // switch (action) {
    //   case 'star':
    //     updateData.is_starred = value;
    //     break;
    //   case 'markAsRead':
    //     updateData.unread_count = 0;
    //     break;
    //   case 'setPriority':
    //     updateData.priority = value;
    //     break;
    //   default:
    //     return NextResponse.json(
    //       { success: false, error: 'Geçersiz işlem türü' },
    //       { status: 400 }
    //     );
    // }

    // const { data: updatedThread, error } = await supabase
    //   .from('message_threads')
    //   .update(updateData)
    //   .eq('id', threadId)
    //   .eq('tenant_id', tenantCheck.tenant.id)
    //   .select()
    //   .single();

    // For demo, update the thread in our array
    const threadIndex = DEMO_MESSAGE_THREADS.findIndex(t => 
      t.id === threadId && t.tenantId === tenantCheck.tenant.id
    );

    if (threadIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Konuşma bulunamadı' },
        { status: 404 }
      );
    }

    const thread = DEMO_MESSAGE_THREADS[threadIndex];

    switch (action) {
      case 'star':
        thread.isStarred = value;
        break;
      case 'markAsRead':
        thread.unreadCount = 0;
        break;
      case 'setPriority':
        thread.priority = value;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz işlem türü' },
          { status: 400 }
        );
    }

    thread.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: thread,
      message: 'Konuşma başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Error updating message thread:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Konuşma güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}