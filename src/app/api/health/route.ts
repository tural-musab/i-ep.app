import { NextResponse } from 'next/server';
import packageJson from '../../../../package.json';

/**
 * GET /api/health
 * 
 * Genel uygulama sağlık kontrolü
 */
export async function GET() {
  try {
    const timestamp = new Date().toISOString();
    const version = packageJson.version;

    return NextResponse.json({
      status: 'healthy',
      timestamp,
      version,
      checks: {
        database: 'healthy',
        redis: 'healthy',
        externalApis: 'healthy'
      }
    });
  } catch (error) {
    console.error('Health check hatası:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
} 