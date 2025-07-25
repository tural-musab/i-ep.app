import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/server';
import { createClient } from '@supabase/supabase-js';

// Demo kullanıcı verileri - Turkish educational demo system
const DEMO_USERS = {
  admin: {
    id: 'admin-demo-1234-5678-9012345678ab',
    email: 'mudur@ataturkilkokulu.edu.tr',
    password: 'demo123',
    user_metadata: {
      full_name: 'Mehmet Yılmaz',
      role: 'admin',
      title: 'Okul Müdürü',
      phone: '+90 532 123 4567',
      department: 'Yönetim'
    }
  },
  teacher: {
    id: 'teacher-demo-1234-5678-901234567890',
    email: 'ayse.koc@ataturkilkokulu.edu.tr',
    password: 'demo123',
    user_metadata: {
      full_name: 'Ayşe Koç',
      role: 'teacher',
      title: 'Sınıf Öğretmeni',
      phone: '+90 532 234 5678',
      department: '4-A Sınıfı',
      specialization: 'Sınıf Öğretmenliği'
    }
  },
  student: {
    id: 'student-demo-1111-2222-333344445555',
    email: 'zeynep.yilmaz@gmail.com',
    password: 'demo123',
    user_metadata: {
      full_name: 'Zeynep Yılmaz',
      role: 'student',
      student_number: '2024001',
      birth_date: '2015-03-15',
      parent_phone: '+90 532 111 2222',
      address: 'Fenerbahçe Mahallesi, İstanbul'
    }
  },
  parent: {
    id: 'parent-demo-1111-2222-333344445555',
    email: 'mehmet.yilmaz.veli@gmail.com',
    password: 'demo123',
    user_metadata: {
      full_name: 'Mehmet Yılmaz (Veli)',
      role: 'parent',
      occupation: 'Mühendis',
      phone: '+90 532 111 2222',
      children: ['2024001'],
      emergency_contact: 'Ayşe Yılmaz - +90 532 111 2223'
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    // Role validation
    if (!role || !DEMO_USERS[role as keyof typeof DEMO_USERS]) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı rolü' },
        { status: 400 }
      );
    }

    // Get demo user data
    const demoUser = DEMO_USERS[role as keyof typeof DEMO_USERS];

    // Create Supabase client with service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Try to sign in the demo user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: demoUser.email,
      password: demoUser.password
    });

    if (authError) {
      // If user doesn't exist, create them
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: demoUser.email,
        password: demoUser.password,
        user_metadata: demoUser.user_metadata,
        email_confirm: true
      });

      if (createError) {
        console.error('Demo user creation error:', createError);
        return NextResponse.json(
          { error: 'Demo kullanıcısı oluşturulamadı' },
          { status: 500 }
        );
      }

      // Try to sign in again
      const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
        email: demoUser.email,
        password: demoUser.password
      });

      if (retryAuthError) {
        console.error('Demo user signin retry error:', retryAuthError);
        return NextResponse.json(
          { error: 'Demo kullanıcısı ile giriş yapılamadı' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: retryAuthData.user,
        session: retryAuthData.session,
        message: 'Demo kullanıcısı başarıyla oluşturuldu ve giriş yapıldı'
      });
    }

    // Successful sign in
    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
      message: 'Demo kullanıcısı ile başarıyla giriş yapıldı'
    });

  } catch (error) {
    console.error('Demo login API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}

// GET endpoint for demo user information
export async function GET() {
  const roles = Object.keys(DEMO_USERS).map(role => ({
    role,
    email: DEMO_USERS[role as keyof typeof DEMO_USERS].email,
    name: DEMO_USERS[role as keyof typeof DEMO_USERS].user_metadata.full_name,
    title: DEMO_USERS[role as keyof typeof DEMO_USERS].user_metadata.title || 
           DEMO_USERS[role as keyof typeof DEMO_USERS].user_metadata.role
  }));

  return NextResponse.json({
    available_roles: roles,
    demo_tenant: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    demo_domain: 'localhost:3000'
  });
}