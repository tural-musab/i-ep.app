/**
 * Test Authentication API Endpoint
 * Development testing purposes only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant/current-tenant';

export async function GET(request: NextRequest) {
  try {
    // Skip authentication for testing
    const tenant = await getCurrentTenant();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Get mock students data
    const mockStudents = [
      {
        id: '1',
        email: 'student1@test.com',
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        metadata: { student_number: '12345' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      },
      {
        id: '2',
        email: 'student2@test.com',
        first_name: 'Elif',
        last_name: 'Demir',
        metadata: { student_number: '12346' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      },
    ];

    return NextResponse.json({
      message: 'Test endpoint working',
      tenant: tenant,
      mockData: mockStudents,
      count: mockStudents.length,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}
