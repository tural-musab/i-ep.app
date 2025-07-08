import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

/**
 * Request logging middleware
 * Her API isteğini loglar - method, url, duration ve response status
 */
export function logRequest(req: NextRequest, res: NextResponse, startTime: number) {
  const duration = Date.now() - startTime;
  const { method, url } = req;
  
  // Request bilgilerini log'la
  logger.info({
    method,
    url,
    duration,
    status: res.status,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    referer: req.headers.get('referer'),
  }, 'HTTP Request');
}

/**
 * Başlangıç zamanını kaydet ve response işlemek için kullan
 */
export function createRequestLogger(req: NextRequest) {
  const startTime = Date.now();
  const { method, url } = req;
  
  // Request başlangıcını log'la
  logger.info({
    method,
    url,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
  }, 'HTTP Request Start');
  
  return {
    startTime,
    finish: (res: NextResponse) => logRequest(req, res, startTime)
  };
} 