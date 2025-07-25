import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Admin client oluştur (service_role key ile)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Demo kullanıcıları tanımla
    const demoUsers = [
      {
        email: 'admin@demo.local',
        password: 'demo123',
        user_metadata: {
          full_name: 'Mehmet Yılmaz',
          role: 'admin',
          title: 'Okul Müdürü',
          phone: '+90 532 123 4567',
          department: 'Yönetim'
        },
        email_confirm: true
      },
      {
        email: 'teacher1@demo.local',
        password: 'demo123',
        user_metadata: {
          full_name: 'Ayşe Öztürk',
          role: 'teacher',
          title: 'Matematik Öğretmeni',
          phone: '+90 532 234 5678',
          department: 'Matematik',
          subjects: ['Matematik', 'Geometri']
        },
        email_confirm: true
      },
      {
        email: 'student1@demo.local',
        password: 'demo123',
        user_metadata: {
          full_name: 'Ali Kaya',
          role: 'student',
          class: '5-A',
          student_number: '2024001',
          phone: '+90 532 345 6789',
          parent_phone: '+90 532 456 7890'
        },
        email_confirm: true
      },
      {
        email: 'parent1@demo.local',
        password: 'demo123',
        user_metadata: {
          full_name: 'Fatma Kaya',
          role: 'parent',
          phone: '+90 532 456 7890',
          children: ['Ali Kaya'],
          relation: 'Anne'
        },
        email_confirm: true
      }
    ];

    const results = [];

    for (const user of demoUsers) {
      try {
        // Önce kullanıcının zaten var olup olmadığını kontrol et
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === user.email);

        if (existingUser) {
          results.push({
            email: user.email,
            status: 'already_exists',
            userId: existingUser.id
          });
          continue;
        }

        // Kullanıcıyı oluştur
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: user.user_metadata,
          email_confirm: user.email_confirm
        });

        if (error) {
          results.push({
            email: user.email,
            status: 'error',
            error: error.message
          });
        } else {
          results.push({
            email: user.email,
            status: 'created',
            userId: data.user?.id
          });
        }

      } catch (userError) {
        results.push({
          email: user.email,
          status: 'error',
          error: userError instanceof Error ? userError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Demo users setup completed',
      results,
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('Setup demo users error:', error);
    return NextResponse.json({
      error: 'Failed to setup demo users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}