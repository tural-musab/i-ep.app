/**
 * API Route Template for İ-EP.APP
 * 
 * This template provides a standardized structure for Next.js API routes
 * following the project's coding standards and best practices.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { validateTenantAccess } from '@/lib/auth/tenant-validation';
import { auditLogger } from '@/lib/security/audit';
import { rateLimiter } from '@/lib/security/rate-limiter';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Request body validation schema
const createRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional().default(true),
  metadata: z.record(z.any()).optional(),
});

const updateRequestSchema = createRequestSchema.partial();

// Query parameters validation schema
const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  filter: z.string().optional(),
  sort: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Path parameters validation schema
const pathParamsSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// ============================================================================
// TYPES
// ============================================================================

type CreateRequestData = z.infer<typeof createRequestSchema>;
type UpdateRequestData = z.infer<typeof updateRequestSchema>;
type ListQueryParams = z.infer<typeof listQuerySchema>;
type PathParams = z.infer<typeof pathParamsSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates authentication and returns user session
 */
async function validateAuthentication() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  
  return session;
}

/**
 * Validates tenant access and returns tenant information
 */
async function validateTenant(request: NextRequest, userId: string) {
  const tenantId = request.headers.get('x-tenant-id');
  
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }
  
  const hasAccess = await validateTenantAccess(userId, tenantId);
  
  if (!hasAccess) {
    throw new Error('Access denied to this tenant');
  }
  
  return tenantId;
}

/**
 * Extracts and validates query parameters
 */
function validateQueryParams(request: NextRequest): ListQueryParams {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  
  return listQuerySchema.parse(params);
}

/**
 * Extracts and validates path parameters
 */
function validatePathParams(request: NextRequest): PathParams {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];
  
  return pathParamsSchema.parse({ id });
}

/**
 * Logs audit event for the request
 */
async function logAuditEvent(
  userId: string,
  tenantId: string,
  action: string,
  resourceId?: string,
  metadata?: Record<string, any>
) {
  await auditLogger.logEvent({
    userId,
    tenantId,
    action,
    resourceId,
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Creates standardized error response
 */
function createErrorResponse(error: unknown, context?: string) {
  console.error(`API Error${context ? ` (${context})` : ''}:`, error);
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        success: false,
      },
      { status: 400 }
    );
  }
  
  if (error instanceof Error) {
    const status = error.message.includes('Authentication required') ? 401 :
                  error.message.includes('Access denied') ? 403 :
                  error.message.includes('not found') ? 404 :
                  400;
    
    return NextResponse.json(
      {
        error: error.message,
        success: false,
      },
      { status }
    );
  }
  
  return NextResponse.json(
    {
      error: 'Internal server error',
      success: false,
    },
    { status: 500 }
  );
}

/**
 * Creates standardized success response
 */
function createSuccessResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      data,
      success: true,
    },
    { status }
  );
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/resource - List resources
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter.check(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', success: false },
        { status: 429 }
      );
    }
    
    // Authentication
    const session = await validateAuthentication();
    
    // Tenant validation
    const tenantId = await validateTenant(request, session.user.id);
    
    // Query parameters validation
    const queryParams = validateQueryParams(request);
    
    // Business logic - replace with actual implementation
    const { page, limit, search, filter, sort, order } = queryParams;
    const offset = (page - 1) * limit;
    
    // Simulate database query
    const mockData = Array.from({ length: limit }, (_, i) => ({
      id: `${i + offset + 1}`,
      name: `Item ${i + offset + 1}`,
      description: `Description for item ${i + offset + 1}`,
      isActive: true,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    // Audit logging
    await logAuditEvent(
      session.user.id,
      tenantId,
      'list_resources',
      undefined,
      { page, limit, search, filter }
    );
    
    return createSuccessResponse({
      items: mockData,
      pagination: {
        page,
        limit,
        total: 100, // Replace with actual total count
        totalPages: Math.ceil(100 / limit),
      },
    });
    
  } catch (error) {
    return createErrorResponse(error, 'GET');
  }
}

/**
 * POST /api/resource - Create resource
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter.check(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', success: false },
        { status: 429 }
      );
    }
    
    // Authentication
    const session = await validateAuthentication();
    
    // Tenant validation
    const tenantId = await validateTenant(request, session.user.id);
    
    // Request body validation
    const body = await request.json();
    const validatedData = createRequestSchema.parse(body);
    
    // Business logic - replace with actual implementation
    const newResource = {
      id: `resource-${Date.now()}`,
      ...validatedData,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.id,
    };
    
    // Audit logging
    await logAuditEvent(
      session.user.id,
      tenantId,
      'create_resource',
      newResource.id,
      { data: validatedData }
    );
    
    return createSuccessResponse(newResource, 201);
    
  } catch (error) {
    return createErrorResponse(error, 'POST');
  }
}

/**
 * PUT /api/resource/[id] - Update resource
 */
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter.check(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', success: false },
        { status: 429 }
      );
    }
    
    // Authentication
    const session = await validateAuthentication();
    
    // Tenant validation
    const tenantId = await validateTenant(request, session.user.id);
    
    // Path parameters validation
    const { id } = validatePathParams(request);
    
    // Request body validation
    const body = await request.json();
    const validatedData = updateRequestSchema.parse(body);
    
    // Business logic - replace with actual implementation
    // First, check if resource exists and user has access
    const existingResource = {
      id,
      name: 'Existing Resource',
      description: 'Existing description',
      isActive: true,
      tenantId,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (!existingResource) {
      throw new Error('Resource not found');
    }
    
    if (existingResource.tenantId !== tenantId) {
      throw new Error('Access denied to this resource');
    }
    
    const updatedResource = {
      ...existingResource,
      ...validatedData,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id,
    };
    
    // Audit logging
    await logAuditEvent(
      session.user.id,
      tenantId,
      'update_resource',
      id,
      { 
        oldData: existingResource,
        newData: validatedData 
      }
    );
    
    return createSuccessResponse(updatedResource);
    
  } catch (error) {
    return createErrorResponse(error, 'PUT');
  }
}

/**
 * DELETE /api/resource/[id] - Delete resource
 */
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter.check(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', success: false },
        { status: 429 }
      );
    }
    
    // Authentication
    const session = await validateAuthentication();
    
    // Tenant validation
    const tenantId = await validateTenant(request, session.user.id);
    
    // Path parameters validation
    const { id } = validatePathParams(request);
    
    // Business logic - replace with actual implementation
    // First, check if resource exists and user has access
    const existingResource = {
      id,
      name: 'Existing Resource',
      tenantId,
    };
    
    if (!existingResource) {
      throw new Error('Resource not found');
    }
    
    if (existingResource.tenantId !== tenantId) {
      throw new Error('Access denied to this resource');
    }
    
    // Perform deletion
    // await resourceService.delete(id);
    
    // Audit logging
    await logAuditEvent(
      session.user.id,
      tenantId,
      'delete_resource',
      id,
      { deletedData: existingResource }
    );
    
    return createSuccessResponse({ message: 'Resource deleted successfully' });
    
  } catch (error) {
    return createErrorResponse(error, 'DELETE');
  }
}

// ============================================================================
// EXPORT TYPES (for testing and documentation)
// ============================================================================

export type {
  CreateRequestData,
  UpdateRequestData,
  ListQueryParams,
  PathParams,
};