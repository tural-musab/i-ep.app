import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/ready
 * 
 * Uygulama hazır olma durumu kontrolü - DB bağlantısını test eder
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    // Supabase bağlantısını test etmek için basit bir query yap
    const { error } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      console.error('Database bağlantı hatası:', error);
      
      return NextResponse.json(
        {
          status: 'not_ready',
          timestamp,
          dbConnection: false
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ready',
      timestamp,
      dbConnection: true
    });
  } catch (error) {
    console.error('Ready check hatası:', error);
    
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp,
        dbConnection: false
      },
      { status: 503 }
    );
  }
} 