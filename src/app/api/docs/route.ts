import { NextRequest, NextResponse } from 'next/server'
import { getOpenAPISpec } from '@/lib/api/openapi-spec'

export async function GET(request: NextRequest) {
  try {
    const spec = await getOpenAPISpec()
    
    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('API docs error:', error)
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    )
  }
}