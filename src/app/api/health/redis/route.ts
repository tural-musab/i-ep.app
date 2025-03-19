import { redis } from '@/lib/cache/redis';
import { NextResponse } from 'next/server';

/**
 * GET /api/health/redis
 * 
 * Redis bağlantısı sağlık kontrolü
 */
export async function GET() {
  try {
    // Redis'e basit bir ping-pong kontrolü yap
    const start = Date.now();
    const pong = await redis.ping();
    const latencyMs = Date.now() - start;

    // Temel bir test değeri ekle ve oku
    const testKey = 'health:check';
    const testValue = { timestamp: Date.now() };
    await redis.set(testKey, JSON.stringify(testValue), {
      EX: 60 // 60 saniye geçerli
    });
    const retrievedValue = await redis.get(testKey);
    const parsedValue = retrievedValue ? JSON.parse(retrievedValue) : null;

    return NextResponse.json({
      status: 'ok',
      message: 'Redis bağlantısı sağlıklı',
      ping: pong,
      latency: `${latencyMs}ms`,
      testValue: parsedValue,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Redis health check hatası:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Redis bağlantısı başarısız',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 