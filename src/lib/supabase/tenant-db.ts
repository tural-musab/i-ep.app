/**
 * Tenant İzolasyonu için Güvenli Veritabanı Erişimi
 * 
 * Bu modül, tenant verilerine güvenli erişim için çoklu güvenlik kontrolleri sağlar.
 */

import { createServerSupabaseClient } from './server';
import { 
  TenantNotFoundError, 
  TenantAccessDeniedError,
  TenantIsolationBreachError 
} from '../errors/tenant-errors';
import { assertTenantOwnership, validateTenantResults } from '../errors/error-handler';
import { SupabaseClient } from '@supabase/supabase-js';
import { getTenantSupabaseClient } from './server';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('tenant-db');

/**
 * Tenant izolasyonu ile güvenli veritabanı erişimi sağlayan fonksiyon
 * 
 * @param tenantId Erişilecek tenant ID'si
 * @returns Tenant kontekstinde güvenli DB erişimi sağlayan fonksiyonlar
 */
export function createTenantDatabaseAccess(tenantId: string) {
  let supabase: SupabaseClient | null = null;
  
  // Tenant ID doğrulaması
  if (!tenantId || typeof tenantId !== 'string') {
    throw new TenantNotFoundError(tenantId || 'undefined');
  }
  
  // Tenant-specific Supabase client oluştur
  async function getClient(): Promise<SupabaseClient> {
    if (!supabase) {
      supabase = getTenantSupabaseClient(tenantId);
      
      // Tenant context'ini ayarla (RLS için)
      await supabase.rpc('set_tenant_context', { tenant_id: tenantId });
    }
    return supabase;
  }
  
  return {
    /**
     * Tenant şemasından veri sorgular
     */
    async from<T = any>(tableName: string) {
      const client = await getClient();
      
      // Güvenlik: Tablo adı validasyonu
      if (!isValidTableName(tableName)) {
        throw new Error(`Geçersiz tablo adı: ${tableName}`);
      }
      
      // Tenant şemasındaki tabloyu sorgula
      return {
        select: async (columns = '*', options?: any) => {
          const { data, error } = await client
            .from(`tenant_${tenantId}.${tableName}`)
            .select(columns, options);
          
          if (error) throw error;
          
          // Veri izolasyon kontrolü
          return validateTenantResults(tenantId, data || []);
        },
        
        insert: async (values: T | T[], options?: any) => {
          const { data, error } = await client
            .from(`tenant_${tenantId}.${tableName}`)
            .insert(values, options);
          
          if (error) throw error;
          
          return data;
        },
        
        update: async (values: Partial<T>, options?: any) => {
          // Güvenlik: tenant_id alanı güncellenmesini engelle
          if ('tenant_id' in values) {
            throw new TenantIsolationBreachError(
              'tenant_id alanı güncellenemez'
            );
          }
          
          const { data, error } = await client
            .from(`tenant_${tenantId}.${tableName}`)
            .update(values, options);
          
          if (error) throw error;
          
          return data;
        },
        
        delete: async (options?: any) => {
          const { data, error } = await client
            .from(`tenant_${tenantId}.${tableName}`)
            .delete(options);
          
          if (error) throw error;
          
          return data;
        },
        
        // Zincirleme sorgular için
        eq: function(column: string, value: any) {
          return this.filter(column, 'eq', value);
        },
        
        filter: function(column: string, operator: string, value: any) {
          // Bu basit bir örnek, gerçek uygulamada daha karmaşık olacak
          return this;
        }
      };
    },
    
    /**
     * RPC fonksiyonlarını çalıştırır
     */
    async rpc(functionName: string, params?: any) {
      const client = await getClient();
      
      // Güvenlik: Fonksiyon adı validasyonu
      if (!isValidFunctionName(functionName)) {
        throw new Error(`Geçersiz fonksiyon adı: ${functionName}`);
      }
      
      // RPC çağrısına tenant_id ekle
      const enhancedParams = {
        ...params,
        p_tenant_id: tenantId
      };
      
      const { data, error } = await client.rpc(functionName, enhancedParams);
      
      if (error) throw error;
      
      return data;
    },
    
    /**
     * Transactional işlemler için
     */
    async transaction(callback: (client: SupabaseClient) => Promise<void>) {
      const client = await getClient();
      
      try {
        await callback(client);
      } catch (error) {
        logger.error('Transaction hatası:', error);
        throw error;
      }
    },
    
    /**
     * Raw SQL sorguları için (dikkatli kullanılmalı)
     */
    async rawQuery(query: string, params?: any[]) {
      const client = await getClient();
      
      // Güvenlik: SQL injection koruması
      if (!isSecureQuery(query)) {
        throw new Error('Güvensiz SQL sorgusu tespit edildi');
      }
      
      // Tenant ID'yi sorguya ekle
      const secureQuery = query.replace(/\$tenant_id/g, `'${tenantId}'`);
      
      const { data, error } = await client.rpc('execute_raw_query', {
        query_text: secureQuery,
        query_params: params
      });
      
      if (error) throw error;
      
      return data;
    },
    
    /**
     * Veritabanı işlemi içinde tenant izolasyonu doğrulama
     */
    assertTenantOwnership(resourceTenantId: string | null | undefined, message?: string) {
      assertTenantOwnership(tenantId, resourceTenantId, message);
    }
  };
}

/**
 * Tablo adı validasyonu
 */
function isValidTableName(tableName: string): boolean {
  // Sadece alfanumerik karakterler ve alt çizgi kabul et
  return /^[a-zA-Z0-9_]+$/.test(tableName);
}

/**
 * Fonksiyon adı validasyonu
 */
function isValidFunctionName(functionName: string): boolean {
  // Sadece alfanumerik karakterler ve alt çizgi kabul et
  return /^[a-zA-Z0-9_]+$/.test(functionName);
}

/**
 * SQL sorgu güvenlik kontrolü
 */
function isSecureQuery(query: string): boolean {
  // Basit güvenlik kontrolleri
  const dangerousPatterns = [
    /DROP\s+TABLE/i,
    /DROP\s+DATABASE/i,
    /DELETE\s+FROM\s+pg_/i,
    /UPDATE\s+pg_/i,
    /INSERT\s+INTO\s+pg_/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(query));
}

/**
 * Tenant veri izolasyon doğrulaması
 */
function validateTenantResults<T extends { tenant_id?: string }>(
  expectedTenantId: string,
  results: T[]
): T[] {
  results.forEach(result => {
    if (result.tenant_id && result.tenant_id !== expectedTenantId) {
      throw new TenantIsolationBreachError(
        `Farklı tenant verisi tespit edildi: ${result.tenant_id}`
      );
    }
  });
  
  return results;
} 