import { NextRequest, NextResponse } from 'next/server';
import { verifyTenantAccess } from '@/lib/auth/tenant-auth';

// Message data types
interface CreateMessageRequest {
  threadId?: string;
  receiverId: string;
  content: string;
  subject?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  studentId?: string; // For context about which student
}

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher' | 'admin' | 'student';
  receiverId: string;
  receiverName: string;
  content: string;
  subject?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  isRead: boolean;
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
  studentId?: string;
  tenantId: string;
}

// Demo messages data
const DEMO_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: 'parent-1',
    senderName: 'Mehmet Kaya',
    senderRole: 'parent',
    receiverId: 'teacher-1',
    receiverName: 'Ahmet Yılmaz',
    content: 'Merhaba Ahmet Bey, Ali\'nin matematik dersindeki durumu hakkında bilgi alabilir miyim?',
    subject: 'Ali\'nin Matematik Performansı',
    priority: 'normal',
    timestamp: '2025-01-25T10:15:00Z',
    isRead: true,
    studentId: 'student-1',
    tenantId: 'demo-tenant'
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    senderId: 'teacher-1',
    senderName: 'Ahmet Yılmaz',
    senderRole: 'teacher',
    receiverId: 'parent-1',
    receiverName: 'Mehmet Kaya',
    content: 'Merhaba Mehmet Bey, Ali genel olarak başarılı bir öğrenci. Son sınavda 85 almış.',
    subject: 'Ali\'nin Matematik Performansı',
    priority: 'normal',
    timestamp: '2025-01-25T11:20:00Z',
    isRead: true,
    studentId: 'student-1',
    tenantId: 'demo-tenant'
  },
  {
    id: 'msg-3',
    threadId: 'thread-2',
    senderId: 'teacher-1',
    senderName: 'Ahmet Yılmaz',
    senderRole: 'teacher',
    receiverId: 'parent-2',
    receiverName: 'Fatma Çelik',
    content: 'Merhaba Fatma Hanım, Emre\'nin bu hafta 3 gün matematik dersinde yoktu.',
    subject: 'Emre\'nin Devamsızlık Durumu',
    priority: 'high',
    timestamp: '2025-01-25T12:00:00Z',
    isRead: true,
    studentId: 'student-2',
    tenantId: 'demo-tenant'
  }
];

// Mock user data for demo
const DEMO_USERS = {
  'parent-1': { name: 'Mehmet Kaya', role: 'parent' },
  'parent-2': { name: 'Fatma Çelik', role: 'parent' },
  'teacher-1': { name: 'Ahmet Yılmaz', role: 'teacher' },
  'admin-1': { name: 'Mehmet Yılmaz', role: 'admin' },
  'student-1': { name: 'Ali Kaya', role: 'student' },
  'student-2': { name: 'Emre Çelik', role: 'student' }
};

// GET /api/messages - Get messages for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const userId = searchParams.get('userId') || 'teacher-1'; // Demo fallback
    
    // Verify tenant access
    const tenantCheck = await verifyTenantAccess(request);
    if ('error' in tenantCheck) {
      return NextResponse.json(tenantCheck, { status: 401 });
    }

    // TODO: Replace with real database query
    // const { data: messages, error } = await supabase
    //   .from('messages')
    //   .select(`
    //     *,
    //     sender:sender_id(id, full_name, role),
    //     receiver:receiver_id(id, full_name, role)
    //   `)
    //   .eq('tenant_id', tenantCheck.tenant.id)
    //   .or(threadId ? `thread_id.eq.${threadId}` : `sender_id.eq.${userId},receiver_id.eq.${userId}`)
    //   .order('timestamp', { ascending: true });

    // Filter demo messages
    let filteredMessages = DEMO_MESSAGES.filter(msg => 
      tenantCheck.tenant.id === 'demo-tenant' && (
        threadId ? msg.threadId === threadId : 
        (msg.senderId === userId || msg.receiverId === userId)
      )
    );

    return NextResponse.json({
      success: true,
      data: filteredMessages,
      count: filteredMessages.length
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Mesajlar yüklenirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send new message
export async function POST(request: NextRequest) {
  try {
    // Verify tenant access
    const tenantCheck = await verifyTenantAccess(request);
    if ('error' in tenantCheck) {
      return NextResponse.json(tenantCheck, { status: 401 });
    }

    const messageData: CreateMessageRequest = await request.json();
    
    // Validate required fields
    if (!messageData.receiverId || !messageData.content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Eksik bilgi: Alıcı ve mesaj içeriği gerekli' 
        },
        { status: 400 }
      );
    }

    // Demo user ID (in real app, get from session)
    const senderId = 'teacher-1'; // This would come from authenticated session
    const senderInfo = DEMO_USERS[senderId as keyof typeof DEMO_USERS];
    const receiverInfo = DEMO_USERS[messageData.receiverId as keyof typeof DEMO_USERS];

    if (!senderInfo || !receiverInfo) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Geçersiz gönderici veya alıcı' 
        },
        { status: 400 }
      );
    }

    // Generate new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId: messageData.threadId || `thread-${Date.now()}`,
      senderId,
      senderName: senderInfo.name,
      senderRole: senderInfo.role as Message['senderRole'],
      receiverId: messageData.receiverId,
      receiverName: receiverInfo.name,
      content: messageData.content,
      subject: messageData.subject,
      priority: messageData.priority || 'normal',
      timestamp: new Date().toISOString(),
      isRead: false,
      studentId: messageData.studentId,
      tenantId: tenantCheck.tenant.id
    };

    // TODO: Replace with real database insert
    // const { data: insertedMessage, error } = await supabase
    //   .from('messages')
    //   .insert({
    //     thread_id: newMessage.threadId,
    //     sender_id: newMessage.senderId,
    //     receiver_id: newMessage.receiverId,
    //     content: newMessage.content,
    //     subject: newMessage.subject,
    //     priority: newMessage.priority,
    //     student_id: newMessage.studentId,
    //     tenant_id: newMessage.tenantId
    //   })
    //   .select()
    //   .single();

    // For demo, just add to our demo array (in real app this would be persistent)
    DEMO_MESSAGES.push(newMessage);

    // TODO: Send real-time notification
    // await sendRealtimeNotification(messageData.receiverId, {
    //   type: 'new_message',
    //   data: newMessage
    // });

    // TODO: Send email/SMS notification based on user preferences
    // if (receiverInfo.notifications?.email) {
    //   await sendEmailNotification(receiverInfo.email, newMessage);
    // }

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: 'Mesaj başarıyla gönderildi'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Mesaj gönderilirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// PUT /api/messages - Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    // Verify tenant access
    const tenantCheck = await verifyTenantAccess(request);
    if ('error' in tenantCheck) {
      return NextResponse.json(tenantCheck, { status: 401 });
    }

    const { messageIds, threadId } = await request.json();
    const userId = 'teacher-1'; // This would come from authenticated session

    if (!messageIds && !threadId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Mesaj ID\'leri veya thread ID gerekli' 
        },
        { status: 400 }
      );
    }

    // TODO: Replace with real database update
    // const { data: updatedMessages, error } = await supabase
    //   .from('messages')
    //   .update({ is_read: true, read_at: new Date().toISOString() })
    //   .eq('tenant_id', tenantCheck.tenant.id)
    //   .eq('receiver_id', userId)
    //   .in('id', messageIds || [])
    //   .or(threadId ? `thread_id.eq.${threadId}` : '')
    //   .select();

    // For demo, update the messages in our array
    const updatedCount = DEMO_MESSAGES.filter(msg => {
      const shouldUpdate = msg.tenantId === tenantCheck.tenant.id &&
                          msg.receiverId === userId &&
                          (messageIds ? messageIds.includes(msg.id) : msg.threadId === threadId);
      
      if (shouldUpdate) {
        msg.isRead = true;
      }
      
      return shouldUpdate;
    }).length;

    return NextResponse.json({
      success: true,
      data: { updatedCount },
      message: `${updatedCount} mesaj okundu olarak işaretlendi`
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Mesajlar güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}