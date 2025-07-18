import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import logger from '@/lib/logger';

/**
 * GET /api/ready
 *
 * Uygulama hazır olma durumu kontrolü - DB bağlantısını test eder
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // Supabase bağlantısını test etmek için basit bir query yap
    const { error } = await supabase.from('auth.users').select('count').limit(1).single();

    if (error) {
      logger.error({ err: error }, 'Database bağlantı hatası');

      return NextResponse.json(
        {
          status: 'not_ready',
          timestamp,
          dbConnection: false,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ready',
      timestamp,
      dbConnection: true,
    });
  } catch (error) {
    logger.error({ err: error }, 'Ready check hatası');

    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp,
        dbConnection: false,
      },
      { status: 503 }
    );
  }
}
