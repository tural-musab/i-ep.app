/**
 * Test Tenant API Endpoint
 * Development testing purposes only
 * Tests tenant resolution without authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantFromDomain } from '@/lib/tenant/tenant-domain-resolver';

export async function GET(request: NextRequest) {
  try {
    const hostname = request.headers.get('host') || 'localhost:3000';
    console.log('Testing tenant resolution for hostname:', hostname);
    
    // Test tenant resolution
    const tenantInfo = await resolveTenantFromDomain(hostname);
    
    console.log('Tenant resolution result:', tenantInfo);
    
    return NextResponse.json({
      message: 'Test tenant endpoint working',
      hostname: hostname,
      tenantInfo: tenantInfo,
      headers: {
        'x-tenant-id': request.headers.get('x-tenant-id'),
        'x-tenant-hostname': request.headers.get('x-tenant-hostname'),
        'x-tenant-name': request.headers.get('x-tenant-name'),
        'x-tenant-primary': request.headers.get('x-tenant-primary'),
        'x-tenant-custom-domain': request.headers.get('x-tenant-custom-domain'),
      },
      environment: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('Test tenant error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}