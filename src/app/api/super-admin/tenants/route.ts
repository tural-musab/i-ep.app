/**
 * Super Admin Tenants Management API
 * Sprint 7: Super Admin Paneli - Tenant Yönetimi Endpoint'i
 * 
 * Bu endpoint tenant yönetimi işlemlerini sağlar ve sadece super admin'ler tarafından erişilebilir.
 * 
 * GET /api/super-admin/tenants - Tenant listesi
 * POST /api/super-admin/tenants - Yeni tenant oluşturma
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getLogger } from '@/lib/utils/logger';
import { AuditLogService, AuditLogType } from '@/lib/audit/audit-log';

const logger = getLogger('super-admin-tenants-api');

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
      logger.warn(`Non-admin user attempted to access tenants management: ${user.email}`);
      return { authorized: false, error: 'Super admin access required' };
    }

    return { authorized: true, userId: user.id };
  } catch (error) {
    logger.error('Super admin validation error:', error);
    return { authorized: false, error: 'Authentication verification failed' };
  }
}

/**
 * GET /api/super-admin/tenants
 * Tenant listesini döndürür
 * 
 * @swagger
 * /api/super-admin/tenants:
 *   get:
 *     summary: List all tenants
 *     description: Returns a list of all tenants with their status, metrics and configuration. Requires super admin access.
 *     tags:
 *       - Super Admin
 *       - Tenants
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
 *       - name: status
 *         in: query
 *         description: Filter by tenant status
 *         schema:
 *           type: string
 *           enum: [active, inactive, trial, suspended]
 *       - name: search
 *         in: query
 *         description: Search by tenant name or subdomain
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant list
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
 *                     $ref: '#/components/schemas/TenantSummary'
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
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Pagination hesaplama
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Base query
    let query = supabaseAdmin
      .from('tenants')
      .select(`
        id,
        name,
        subdomain,
        plan_type,
        is_active,
        created_at,
        updated_at,
        settings
      `, { count: 'exact' });

    // Filters
    if (status) {
      if (status === 'active') {
        query = query.eq('is_active', true);
      } else if (status === 'inactive') {
        query = query.eq('is_active', false);
      }
      // Gelecekte plan_type'a göre trial, suspended filtreleri eklenebilir
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,subdomain.ilike.%${search}%`);
    }

    // Pagination ve ordering
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: tenants, error: tenantsError, count } = await query;

    if (tenantsError) {
      logger.error('Error fetching tenants:', tenantsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tenants', timestamp },
        { status: 500 }
      );
    }

    // Her tenant için ek bilgileri al (kullanıcı sayısı, domain sayısı)
    const enrichedTenants = await Promise.all(
      (tenants || []).map(async (tenant) => {
        try {
          // Kullanıcı sayısını al
          const { count: userCount } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          // Domain sayısını al
          const { count: domainCount } = await supabaseAdmin
            .from('tenant_domains')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          // Son aktivite tarihini al (kullanıcıların son giriş tarihi)
          const { data: lastActivity } = await supabaseAdmin
            .from('users')
            .select('last_login_at')
            .eq('tenant_id', tenant.id)
            .not('last_login_at', 'is', null)
            .order('last_login_at', { ascending: false })
            .limit(1);

          return {
            id: tenant.id,
            name: tenant.name,
            subdomain: tenant.subdomain,
            planType: tenant.plan_type,
            status: tenant.is_active ? 'active' : 'inactive',
            userCount: userCount || 0,
            domainCount: domainCount || 0,
            lastActivity: lastActivity?.[0]?.last_login_at || null,
            createdAt: tenant.created_at,
            updatedAt: tenant.updated_at,
            settings: tenant.settings
          };
        } catch (error) {
          logger.warn(`Failed to enrich tenant ${tenant.id}:`, error);
          return {
            id: tenant.id,
            name: tenant.name,
            subdomain: tenant.subdomain,
            planType: tenant.plan_type,
            status: tenant.is_active ? 'active' : 'inactive',
            userCount: 0,
            domainCount: 0,
            lastActivity: null,
            createdAt: tenant.created_at,
            updatedAt: tenant.updated_at,
            settings: tenant.settings
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
      resource_type: 'tenants',
      resource_id: 'list',
      description: `Super admin tenant list access`,
      metadata: { page, limit, status, search, resultCount: enrichedTenants.length }
    });

    logger.info(`Super admin tenant list accessed by ${userId}`, {
      page,
      limit,
      status,
      search,
      resultCount: enrichedTenants.length
    });

    return NextResponse.json({
      success: true,
      data: enrichedTenants,
      meta,
      timestamp
    });

  } catch (error) {
    logger.error('Tenants list endpoint error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch tenants', 
        timestamp 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/super-admin/tenants
 * Yeni tenant oluşturur
 * 
 * @swagger
 * /api/super-admin/tenants:
 *   post:
 *     summary: Create new tenant
 *     description: Creates a new tenant with subdomain and initial configuration. Requires super admin access.
 *     tags:
 *       - Super Admin
 *       - Tenants
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subdomain
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tenant display name
 *                 example: "Örnek Okul"
 *               subdomain:
 *                 type: string
 *                 description: Tenant subdomain (unique)
 *                 pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$"
 *                 example: "ornek-okul"
 *               planType:
 *                 type: string
 *                 enum: [free, basic, premium, enterprise]
 *                 default: "free"
 *                 example: "basic"
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 description: Initial admin user email
 *                 example: "admin@ornek-okul.com"
 *               adminName:
 *                 type: string
 *                 description: Initial admin user name
 *                 example: "Admin Kullanıcı"
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TenantDetail'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Super admin access required
 *       409:
 *         description: Subdomain already exists
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
    const { name, subdomain, planType = 'free', adminEmail, adminName } = body;

    // Required fields kontrolü
    if (!name || !subdomain) {
      return NextResponse.json(
        { success: false, error: 'Name and subdomain are required', timestamp },
        { status: 400 }
      );
    }

    // Subdomain format kontrolü
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Subdomain must be lowercase alphanumeric with hyphens, starting and ending with alphanumeric characters', 
          timestamp 
        },
        { status: 400 }
      );
    }

    // Subdomain benzersizlik kontrolü
    const { data: existingTenant } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (existingTenant) {
      return NextResponse.json(
        { success: false, error: 'Subdomain already exists', timestamp },
        { status: 409 }
      );
    }

    // Yeni tenant oluştur
    const { data: newTenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name,
        subdomain,
        plan_type: planType,
        is_active: true,
        settings: {
          theme: {
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e'
          },
          features: ['user_management', 'basic_reporting'],
          limits: {
            maxUsers: planType === 'free' ? 50 : planType === 'basic' ? 200 : 1000,
            maxStorage: planType === 'free' ? 1 : planType === 'basic' ? 10 : 100 // GB
          }
        }
      })
      .select()
      .single();

    if (tenantError || !newTenant) {
      logger.error('Error creating tenant:', tenantError);
      return NextResponse.json(
        { success: false, error: 'Failed to create tenant', timestamp },
        { status: 500 }
      );
    }

    // Default subdomain oluştur
    const { error: domainError } = await supabaseAdmin
      .from('tenant_domains')
      .insert({
        tenant_id: newTenant.id,
        domain: `${subdomain}.i-ep.app`,
        type: 'subdomain',
        is_primary: true,
        is_verified: true
      });

    if (domainError) {
      logger.warn('Failed to create default domain:', domainError);
    }

    // Eğer admin email belirtilmişse, admin kullanıcı oluştur
    if (adminEmail && adminName) {
      try {
        const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: Math.random().toString(36).slice(-12), // Geçici şifre
          email_confirm: true,
          user_metadata: {
            tenant_id: newTenant.id,
            role: 'admin',
            full_name: adminName
          }
        });

        if (adminError) {
          logger.warn('Failed to create admin user:', adminError);
        } else {
          // Tenant-specific users tablosuna da ekle
          await supabaseAdmin
            .from('users')
            .insert({
              id: adminUser.user.id,
              tenant_id: newTenant.id,
              email: adminEmail,
              first_name: adminName.split(' ')[0] || adminName,
              last_name: adminName.split(' ').slice(1).join(' ') || '',
              role: 'admin',
              is_active: true,
              verification_status: 'verified'
            });
        }
      } catch (adminCreationError) {
        logger.warn('Admin user creation failed:', adminCreationError);
      }
    }

    // Audit log
    await AuditLogService.log({
      tenant_id: newTenant.id,
      action: AuditLogType.TENANT_CREATED,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'tenants',
      resource_id: newTenant.id,
      description: `New tenant created: ${name}`,
      new_state: newTenant,
      metadata: { name, subdomain, planType, adminEmail: adminEmail ? true : false }
    });

    logger.info(`New tenant created by super admin ${userId}`, {
      tenantId: newTenant.id,
      name,
      subdomain,
      planType
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newTenant.id,
        name: newTenant.name,
        subdomain: newTenant.subdomain,
        planType: newTenant.plan_type,
        status: newTenant.is_active ? 'active' : 'inactive',
        createdAt: newTenant.created_at,
        settings: newTenant.settings,
        defaultDomain: `${subdomain}.i-ep.app`
      },
      timestamp
    }, { status: 201 });

  } catch (error) {
    logger.error('Tenant creation endpoint error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create tenant', 
        timestamp 
      },
      { status: 500 }
    );
  }
} 