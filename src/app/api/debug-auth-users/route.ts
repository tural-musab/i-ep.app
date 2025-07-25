import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
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

    // Demo kullanıcılarının emaillerini kontrol et
    const demoEmails = [
      'admin@demo.local',
      'teacher1@demo.local',
      'student1@demo.local',
      'parent1@demo.local'
    ];

    const results = [];
    
    for (const email of demoEmails) {
      // Auth kullanıcılarını listele
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authError) {
        results.push({
          email,
          authExists: false,
          error: authError.message
        });
        continue;
      }

      const authUser = authUsers.users.find(u => u.email === email);
      
      results.push({
        email,
        authExists: !!authUser,
        authUserId: authUser?.id,
        authCreated: authUser?.created_at,
        authConfirmed: authUser?.email_confirmed_at
      });
    }

    return NextResponse.json({
      message: 'Demo user authentication status',
      totalAuthUsers: (await supabaseAdmin.auth.admin.listUsers()).data?.users?.length || 0,
      demoUsers: results,
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('Debug auth users error:', error);
    return NextResponse.json({
      error: 'Failed to check auth users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}