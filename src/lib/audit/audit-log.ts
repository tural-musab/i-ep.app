/**
 * Denetim Günlüğü (Audit Log) Sistemi
 *
 * Bu modül, sistemdeki önemli olayları ve değişiklikleri kaydetmek
 * ve KVKK/GDPR uyumluluğunu sağlamak için kullanılır.
 */

import { createServerSupabaseClient } from '../supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UAParser } from 'ua-parser-js';

// Audit log olay tipleri
export enum AuditLogType {
  // Tenant/Domain olayları
  TENANT_CREATED = 'tenant.created',
  TENANT_UPDATED = 'tenant.updated',
  TENANT_DELETED = 'tenant.deleted',
  DOMAIN_ADDED = 'domain.added',
  DOMAIN_VERIFIED = 'domain.verified',
  DOMAIN_DELETED = 'domain.deleted',
  DOMAIN_SET_PRIMARY = 'domain.set_primary',

  // Kullanıcı olayları
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  USER_LOGIN_FAILED = 'user.login_failed',
  USER_LOGOUT = 'user.logout',
  USER_ROLE_CHANGED = 'user.role_changed',
  USER_PASSWORD_CHANGED = 'user.password_changed',
  USER_PASSWORD_RESET = 'user.password_reset',

  // Veri olayları
  DATA_EXPORTED = 'data.exported',
  DATA_IMPORTED = 'data.imported',
  DATA_DELETED = 'data.deleted',

  // Yetkilendirme olayları
  AUTH_PERMISSION_GRANTED = 'auth.permission_granted',
  AUTH_PERMISSION_REVOKED = 'auth.permission_revoked',
  AUTH_ROLE_CREATED = 'auth.role_created',
  AUTH_ROLE_UPDATED = 'auth.role_updated',
  AUTH_ROLE_DELETED = 'auth.role_deleted',

  // Sistem olayları
  SYSTEM_CONFIG_CHANGED = 'system.config_changed',
  SYSTEM_BACKUP_CREATED = 'system.backup_created',
  SYSTEM_RESTORE_PERFORMED = 'system.restore_performed',
  SYSTEM_ERROR = 'system.error',

  // API erişim olayları
  API_ACCESS = 'api.access',
  API_ERROR = 'api.error',

  // Özel olaylar
  CUSTOM = 'custom',
}

// Audit log giriş yapısı
export interface AuditLogEntry {
  id?: string;
  tenant_id: string;
  action: AuditLogType;
  actor_id?: string;
  actor_type?: 'user' | 'system' | 'api';
  resource_type: string;
  resource_id: string;
  description: string;
  previous_state?: any;
  new_state?: any;
  metadata?: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
  created_at?: Date;
}

/**
 * Audit Log servisi - sistem olaylarını kaydetmek için
 */
export class AuditLogService {
  /**
   * Yeni bir audit log girdisi oluştur
   */
  static async log(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<void> {
    try {
      const supabase = createServerSupabaseClient();

      // Audit log tablosuna kaydet
      const { error } = await supabase.from('audit_logs').insert({
        ...entry,
        created_at: new Date(),
      });

      if (error) {
        console.error('Audit log kaydı sırasında hata:', error);
      }
    } catch (error) {
      console.error('Audit log oluşturma hatası:', error);
    }
  }

  /**
   * İstek bilgilerinden audit log oluştur (sunucu tarafı için)
   */
  static async logFromRequest(
    req: Request,
    action: AuditLogType,
    tenantId: string,
    resourceType: string,
    resourceId: string,
    description: string,
    previousState?: any,
    newState?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // İstek bilgilerini al
      const session = await getServerSession(authOptions);
      const userAgent = req.headers.get('user-agent') || undefined;
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

      // UA Parser ile tarayıcı bilgilerini çıkar
      let browserInfo = {};
      if (userAgent) {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        browserInfo = {
          browser: `${result.browser.name} ${result.browser.version}`,
          os: `${result.os.name} ${result.os.version}`,
          device: result.device.type || 'desktop',
        };
      }

      // Metadata'yı genişlet
      const enhancedMetadata = {
        ...metadata,
        request_url: req.url,
        request_method: req.method,
        browser_info: browserInfo,
      };

      // Audit log girdisi oluştur
      await this.log({
        tenant_id: tenantId,
        action,
        actor_id: session?.user?.id,
        actor_type: session ? 'user' : 'api',
        resource_type: resourceType,
        resource_id: resourceId,
        description,
        previous_state: previousState,
        new_state: newState,
        metadata: enhancedMetadata,
        user_agent: userAgent,
        ip_address: Array.isArray(ip) ? ip[0] : ip,
      });
    } catch (error) {
      console.error('İstek denetim günlüğü oluşturma hatası:', error);
    }
  }

  /**
   * Tenant için audit log girdilerini sorgula
   */
  static async queryLogs(
    tenantId: string,
    options: {
      action?: AuditLogType | AuditLogType[];
      actorId?: string;
      resourceType?: string;
      resourceId?: string;
      fromDate?: Date;
      toDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<AuditLogEntry[]> {
    try {
      const supabase = createServerSupabaseClient();

      // Filtreleri hazırla
      let query = supabase.from('audit_logs').select('*').eq('tenant_id', tenantId);

      // Sorgulama filtrelerini ekle
      if (options.action) {
        if (Array.isArray(options.action)) {
          query = query.in('action', options.action);
        } else {
          query = query.eq('action', options.action);
        }
      }

      if (options.actorId) {
        query = query.eq('actor_id', options.actorId);
      }

      if (options.resourceType) {
        query = query.eq('resource_type', options.resourceType);
      }

      if (options.resourceId) {
        query = query.eq('resource_id', options.resourceId);
      }

      if (options.fromDate) {
        query = query.gte('created_at', options.fromDate.toISOString());
      }

      if (options.toDate) {
        query = query.lte('created_at', options.toDate.toISOString());
      }

      // Sıralama, limit ve offset ekle
      query = query
        .order('created_at', { ascending: false })
        .limit(options.limit || 100)
        .range(options.offset || 0, (options.offset || 0) + (options.limit || 100) - 1);

      // Sorguyu çalıştır
      const { data, error } = await query;

      if (error) {
        console.error('Audit log sorgusu sırasında hata:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Audit log sorgulama hatası:', error);
      return [];
    }
  }

  /**
   * Kaynak değişikliği için audit log kaydet
   */
  static async logResourceChange(
    tenantId: string,
    actorId: string,
    action: AuditLogType,
    resourceType: string,
    resourceId: string,
    description: string,
    previousState: any,
    newState: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      tenant_id: tenantId,
      action,
      actor_id: actorId,
      actor_type: 'user',
      resource_type: resourceType,
      resource_id: resourceId,
      description,
      previous_state: previousState,
      new_state: newState,
      metadata,
    });
  }

  /**
   * Sistem olayı için audit log kaydet
   */
  static async logSystemEvent(
    tenantId: string,
    action: AuditLogType,
    resourceType: string,
    resourceId: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      tenant_id: tenantId,
      action,
      actor_type: 'system',
      resource_type: resourceType,
      resource_id: resourceId,
      description,
      metadata,
    });
  }
}
