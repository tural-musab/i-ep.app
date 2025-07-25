import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';

/**
 * GET /api/ready
 *
 * Uygulama hazır olma durumu kontrolü - DB bağlantısını test eder
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // SYSTEM HEALTH FIX: Use proper server client and test with a simple query
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from('users').select('count').limit(1).single();

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
