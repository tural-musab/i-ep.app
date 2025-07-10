/**
 * Super Admin Domains Management API
 * Sprint 7: Super Admin Paneli - Domain Yönetimi Endpoint'i
 * 
 * Bu endpoint domain yönetimi işlemlerini sağlar ve sadece super admin'ler tarafından erişilebilir.
 * 
 * GET /api/super-admin/domains - Domain listesi
 * POST /api/super-admin/domains - Yeni domain ekleme
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getLogger } from '@/lib/utils/logger';
import { AuditLogService, AuditLogType } from '@/lib/audit/audit-log';

const logger = getLogger('super-admin-domains-api');

/**
 * Super Admin yetki kontrolü
 */
async function validateSuperAdminAccess(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'Authorization header missing or invalid' };
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return { authorized: false, error: 'Invalid or expired token' };
    }

    // Super admin rolü kontrolü
    const { data: isSuperAdmin, error: roleError } = await supabaseAdmin.rpc('is_super_admin');
    
    if (roleError || !isSuperAdmin) {
      logger.warn(`Non-admin user attempted to access domains management: ${user.email}`);
      return { authorized: false, error: 'Super admin access required' };
    }

    return { authorized: true, userId: user.id };
  } catch (error) {
    logger.error('Super admin validation error:', error);
    return { authorized: false, error: 'Authentication verification failed' };
  }
}

/**
 * Domain SSL durumunu kontrol etme (basit versiyon)
 */
async function checkDomainSSL(domain: string): Promise<{
  isValid: boolean;
  expiresAt?: string;
  daysUntilExpiry?: number;
  issuer?: string;
  status: 'valid' | 'expiring' | 'expired' | 'invalid' | 'unknown';
}> {
  try {
    // Basit SSL kontrolü - production'da daha detaylı olacak
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      // Gerçek SSL bilgilerini almak için farklı yöntemler kullanılacak
      // Şimdilik mockup veri dönüyoruz
      const mockExpiryDate = new Date();
      mockExpiryDate.setMonth(mockExpiryDate.getMonth() + 3);
      
      const daysUntilExpiry = Math.floor((mockExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      return {
        isValid: true,
        expiresAt: mockExpiryDate.toISOString(),
        daysUntilExpiry,
        issuer: "Let's Encrypt",
        status: daysUntilExpiry > 30 ? 'valid' : 'expiring'
      };
    } else {
      return {
        isValid: false,
        status: 'invalid'
      };
    }
  } catch (error) {
    logger.warn(`SSL check failed for domain ${domain}:`, error);
    return {
      isValid: false,
      status: 'invalid'
    };
  }
}

/**
 * GET /api/super-admin/domains
 * Domain listesini döndürür
 * 
 * @swagger
 * /api/super-admin/domains:
 *   get:
 *     summary: List all domains
 *     description: Returns a list of all domains across all tenants with SSL status and verification info. Requires super admin access.
 *     tags:
 *       - Super Admin
 *       - Domains
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - name: limit
 *         in: query
 *         description: Items per page
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *       - name: type
 *         in: query
 *         description: Filter by domain type
 *         schema:
 *           type: string
 *           enum: [subdomain, custom]
 *       - name: status
 *         in: query
 *         description: Filter by verification status
 *         schema:
 *           type: string
 *           enum: [verified, pending, failed]
 *       - name: tenant_id
 *         in: query
 *         description: Filter by tenant ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: search
 *         in: query
 *         description: Search by domain name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Domain list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DomainSummary'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Super admin access required
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  try {
    // Super admin yetki kontrolü
    const { authorized, userId, error: authError } = await validateSuperAdminAccess(request);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: authError || 'Unauthorized', timestamp },
        { status: 401 }
      );
    }

    // Query parametrelerini al
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const tenantId = url.searchParams.get('tenant_id');
    const search = url.searchParams.get('search');

    // Pagination hesaplama
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Base query with tenant information
    let query = supabaseAdmin
      .from('tenant_domains')
      .select(`
        id,
        tenant_id,
        domain,
        type,
        is_primary,
        is_verified,
        verification_status,
        verified_at,
        ssl_status,
        created_at,
        updated_at,
        tenants!inner(
          id,
          name,
          subdomain
        )
      `, { count: 'exact' });

    // Filters
    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      if (status === 'verified') {
        query = query.eq('is_verified', true);
      } else if (status === 'pending') {
        query = query.eq('is_verified', false).eq('verification_status', 'pending');
      } else if (status === 'failed') {
        query = query.eq('is_verified', false).eq('verification_status', 'failed');
      }
    }

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (search) {
      query = query.ilike('domain', `%${search}%`);
    }

    // Pagination ve ordering
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: domains, error: domainsError, count } = await query;

    if (domainsError) {
      logger.error('Error fetching domains:', domainsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch domains', timestamp },
        { status: 500 }
      );
    }

    // Her domain için SSL durumunu kontrol et (paralel)
    const enrichedDomains = await Promise.all(
      (domains || []).map(async (domain) => {
                 try {
           let sslInfo: {
             isValid: boolean;
             status: 'valid' | 'expiring' | 'expired' | 'invalid' | 'unknown';
             daysUntilExpiry: number | null;
             issuer: string | null;
             expiresAt: string | null;
           } = {
             isValid: false,
             status: 'unknown',
             daysUntilExpiry: null,
             issuer: null,
             expiresAt: null
           };

           // Custom domain'ler için SSL kontrolü yap
           if (domain.type === 'custom' && domain.is_verified) {
             try {
               sslInfo = await checkDomainSSL(domain.domain);
             } catch (error) {
               logger.warn(`SSL check failed for ${domain.domain}:`, error);
             }
           } else if (domain.type === 'subdomain') {
             // Subdomain'ler için varsayılan olarak valid kabul et
             sslInfo = {
               isValid: true,
               status: 'valid',
               daysUntilExpiry: 90,
               issuer: "Cloudflare",
               expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
             };
           }

           return {
             id: domain.id,
             tenantId: domain.tenant_id,
             tenantName: (domain.tenants as any).name,
             tenantSubdomain: (domain.tenants as any).subdomain,
            domain: domain.domain,
            type: domain.type,
            isPrimary: domain.is_primary,
            isVerified: domain.is_verified,
            verificationStatus: domain.verification_status,
            verifiedAt: domain.verified_at,
            ssl: sslInfo,
            createdAt: domain.created_at,
            updatedAt: domain.updated_at
          };
        } catch (error) {
          logger.warn(`Failed to enrich domain ${domain.id}:`, error);
          return {
            id: domain.id,
            tenantId: domain.tenant_id,
            tenantName: domain.tenants.name,
            tenantSubdomain: domain.tenants.subdomain,
            domain: domain.domain,
            type: domain.type,
            isPrimary: domain.is_primary,
            isVerified: domain.is_verified,
            verificationStatus: domain.verification_status,
            verifiedAt: domain.verified_at,
            ssl: {
              isValid: false,
              status: 'unknown' as const,
              daysUntilExpiry: null,
              issuer: null,
              expiresAt: null
            },
            createdAt: domain.created_at,
            updatedAt: domain.updated_at
          };
        }
      })
    );

    // Pagination metadata
    const totalPages = Math.ceil((count || 0) / limit);
    const meta = {
      total: count || 0,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    // Audit log
    await AuditLogService.log({
      tenant_id: 'system',
      action: AuditLogType.API_ACCESS,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'domains',
      resource_id: 'list',
      description: `Super admin domains list access`,
      metadata: { page, limit, type, status, tenantId, search, resultCount: enrichedDomains.length }
    });

    logger.info(`Super admin domains list accessed by ${userId}`, {
      page,
      limit,
      type,
      status,
      tenantId,
      search,
      resultCount: enrichedDomains.length
    });

    return NextResponse.json({
      success: true,
      data: enrichedDomains,
      meta,
      timestamp
    });

  } catch (error) {
    logger.error('Domains list endpoint error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch domains', 
        timestamp 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/super-admin/domains
 * Yeni domain ekler
 * 
 * @swagger
 * /api/super-admin/domains:
 *   post:
 *     summary: Add new domain
 *     description: Adds a custom domain to a tenant. Requires super admin access.
 *     tags:
 *       - Super Admin
 *       - Domains
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenant_id
 *               - domain
 *               - type
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: Target tenant ID
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               domain:
 *                 type: string
 *                 description: Domain name
 *                 example: "okul.example.com"
 *               type:
 *                 type: string
 *                 enum: [custom, subdomain]
 *                 description: Domain type
 *                 example: "custom"
 *               is_primary:
 *                 type: boolean
 *                 description: Set as primary domain for tenant
 *                 default: false
 *                 example: false
 *     responses:
 *       201:
 *         description: Domain added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DomainDetail'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Super admin access required
 *       409:
 *         description: Domain already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  try {
    // Super admin yetki kontrolü
    const { authorized, userId, error: authError } = await validateSuperAdminAccess(request);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: authError || 'Unauthorized', timestamp },
        { status: 401 }
      );
    }

    // Request body'yi al ve validate et
    const body = await request.json();
    const { tenant_id, domain, type, is_primary = false } = body;

    // Required fields kontrolü
    if (!tenant_id || !domain || !type) {
      return NextResponse.json(
        { success: false, error: 'tenant_id, domain and type are required', timestamp },
        { status: 400 }
      );
    }

    // Tenant varlık kontrolü
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('id, name')
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found', timestamp },
        { status: 400 }
      );
    }

    // Domain format kontrolü (basit)
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain format', timestamp },
        { status: 400 }
      );
    }

    // Domain benzersizlik kontrolü
    const { data: existingDomain } = await supabaseAdmin
      .from('tenant_domains')
      .select('id')
      .eq('domain', domain)
      .single();

    if (existingDomain) {
      return NextResponse.json(
        { success: false, error: 'Domain already exists', timestamp },
        { status: 409 }
      );
    }

    // Eğer primary olarak ayarlanacaksa, mevcut primary'yi güncelle
    if (is_primary) {
      await supabaseAdmin
        .from('tenant_domains')
        .update({ is_primary: false })
        .eq('tenant_id', tenant_id)
        .eq('is_primary', true);
    }

    // Yeni domain ekle
    const { data: newDomain, error: domainError } = await supabaseAdmin
      .from('tenant_domains')
      .insert({
        tenant_id,
        domain,
        type,
        is_primary,
        is_verified: type === 'subdomain', // Subdomain'ler otomatik verified
        verification_status: type === 'subdomain' ? 'verified' : 'pending',
        verified_at: type === 'subdomain' ? new Date().toISOString() : null,
        ssl_status: type === 'subdomain' ? 'valid' : 'pending'
      })
      .select(`
        id,
        tenant_id,
        domain,
        type,
        is_primary,
        is_verified,
        verification_status,
        verified_at,
        ssl_status,
        created_at,
        updated_at
      `)
      .single();

    if (domainError || !newDomain) {
      logger.error('Error creating domain:', domainError);
      return NextResponse.json(
        { success: false, error: 'Failed to create domain', timestamp },
        { status: 500 }
      );
    }

    // Audit log
    await AuditLogService.log({
      tenant_id: tenant_id,
      action: AuditLogType.DOMAIN_ADDED,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'domains',
      resource_id: newDomain.id,
      description: `Domain added to tenant ${tenant.name}: ${domain}`,
      new_state: newDomain,
      metadata: { domain, type, is_primary, tenant_name: tenant.name }
    });

    logger.info(`New domain added by super admin ${userId}`, {
      domainId: newDomain.id,
      domain,
      tenantId: tenant_id,
      type,
      is_primary
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newDomain,
        tenant: {
          id: tenant.id,
          name: tenant.name
        }
      },
      timestamp
    }, { status: 201 });

  } catch (error) {
    logger.error('Domain creation endpoint error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create domain', 
        timestamp 
      },
      { status: 500 }
    );
  }
} 