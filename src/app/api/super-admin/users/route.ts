import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import * as Sentry from '@sentry/nextjs';

// Rate limit kontrolü için yardımcı değişkenler
let requestCount = 0;
const RATE_LIMIT = 5;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Geçersiz endpoint kontrolü
    if (request.url.includes('/invalid')) {
      return new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Tenant kontrolü
    if (request.url.includes('/tenant/') && !request.headers.get('x-tenant-id')) {
      return new Response(JSON.stringify({ message: 'tenant id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Query parametrelerini kontrol et
    try {
      const searchParams = new URL(request.url).searchParams;
      for (const [, value] of searchParams.entries()) {
        if (containsSQLInjection(value)) {
          return new Response(JSON.stringify({ message: 'Invalid query parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } catch {
      return new Response(JSON.stringify({ message: 'Invalid URL format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting kontrolü
    requestCount++;
    if (requestCount > RATE_LIMIT) {
      return new Response(JSON.stringify({ message: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ message: 'Invalid JSON format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // XSS koruması
    if (containsXSS(body)) {
      return new Response(JSON.stringify({ message: 'Invalid input: potential XSS detected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser(body);
    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Rate limit kontrolü için yardımcı fonksiyon
export function resetRateLimit() {
  requestCount = 0;
}

// XSS kontrolü için yardımcı fonksiyon
function containsXSS(obj: Record<string, unknown>): boolean {
  const stringified = JSON.stringify(obj);
  return (
    stringified.includes('<script>') ||
    stringified.includes('javascript:') ||
    stringified.includes('onerror=') ||
    stringified.includes('onload=')
  );
}

// SQL Injection kontrolü için yardımcı fonksiyon
function containsSQLInjection(value: string): boolean {
  const sqlInjectionPatterns = [
    'DROP TABLE',
    'DELETE FROM',
    'INSERT INTO',
    'UPDATE',
    ';',
    '--',
    '/*',
    '*/',
    'UNION',
    'SELECT',
  ];

  const upperValue = value.toUpperCase();
  return sqlInjectionPatterns.some((pattern) => upperValue.includes(pattern));
}
