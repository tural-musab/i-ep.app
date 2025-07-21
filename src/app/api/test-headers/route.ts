/**
 * Test Headers API Endpoint
 * Development testing purposes only
 * Tests if middleware headers are being set correctly
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const allHeaders = Object.fromEntries(request.headers.entries());

    const relevantHeaders = Object.keys(allHeaders)
      .filter((key) => key.startsWith('x-tenant-') || key.startsWith('x-auth-') || key === 'host')
      .reduce(
        (obj, key) => {
          obj[key] = allHeaders[key];
          return obj;
        },
        {} as Record<string, string>
      );

    return NextResponse.json({
      message: 'Headers test endpoint',
      hostname: request.headers.get('host'),
      tenantHeaders: {
        'x-tenant-id': request.headers.get('x-tenant-id'),
        'x-tenant-hostname': request.headers.get('x-tenant-hostname'),
        'x-tenant-name': request.headers.get('x-tenant-name'),
        'x-tenant-primary': request.headers.get('x-tenant-primary'),
        'x-tenant-custom-domain': request.headers.get('x-tenant-custom-domain'),
      },
      authHeaders: {
        'x-auth-user-id': request.headers.get('x-auth-user-id'),
        'x-auth-user-email': request.headers.get('x-auth-user-email'),
        'x-auth-user-role': request.headers.get('x-auth-user-role'),
      },
      allRelevantHeaders: relevantHeaders,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Test headers error:', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
