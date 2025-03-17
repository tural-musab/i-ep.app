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

/**
 * Tenant izolasyonu ile güvenli veritabanı erişimi sağlayan fonksiyon
 * 
 * @param tenantId Erişilecek tenant ID'si
 * @returns Tenant kontekstinde güvenli DB erişimi sağlayan fonksiyonlar
 */
export function createTenantDatabaseAccess(tenantId: string) {
  if (!tenantId) {
    throw new TenantNotFoundError();
  }
  
  // Supabase istemcisi oluştur
  const supabase = createServerSupabaseClient();
  
  // Tenant konteksti ayarla (veritabanı seviyesinde)
  const setTenantContext = async () => {
    await supabase.rpc('set_tenant_context', { tenant_id: tenantId });
  };
  
  return {
    /**
     * Tenant şemasındaki tabloya güvenli erişim
     * 
     * @param tableName Tablo adı (tenant şemasında)
     */
    async query<T = any>(tableName: string) {
      await setTenantContext();
      
      return {
        /**
         * Tüm kayıtları getir (tenant izolasyonu ile)
         */
        async getAll() {
          const { data, error } = await supabase
            .from(`tenant_${tenantId}.${tableName}`)
            .select('*');
            
          if (error) throw error;
          
          // İzolasyon kontrolü - paranoid mod
          return validateTenantResults(tenantId, data || []);
        },
        
        /**
         * ID'ye göre kayıt getir (tenant izolasyonu ile)
         */
        async getById(id: string) {
          const { data, error } = await supabase
            .from(`tenant_${tenantId}.${tableName}`)
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) {
            if (error.code === 'PGRST116') {
              throw new TenantNotFoundError(`${tableName} kaydı bulunamadı: ${id}`);
            }
            throw error;
          }
          
          // İzolasyon kontrolü
          if (data.tenant_id && data.tenant_id !== tenantId) {
            throw new TenantIsolationBreachError(
              `Erişilen kayıt başka bir tenant'a ait: ${data.tenant_id}`
            );
          }
          
          return data;
        },
        
        /**
         * Yeni kayıt oluştur (tenant izolasyonu ile)
         */
        async create(data: any) {
          // Tenant ID'sini veri içine otomatik ekle
          const dataWithTenant = {
            ...data,
            tenant_id: tenantId
          };
          
          const { data: result, error } = await supabase
            .from(`tenant_${tenantId}.${tableName}`)
            .insert(dataWithTenant)
            .select()
            .single();
            
          if (error) throw error;
          
          return result;
        },
        
        /**
         * Kaydı güncelle (tenant izolasyonu ile)
         */
        async update(id: string, data: any) {
          // Önce kaydın tenant'a ait olduğunu doğrula
          const { data: existingData } = await supabase
            .from(`tenant_${tenantId}.${tableName}`)
            .select('tenant_id')
            .eq('id', id)
            .single();
            
          if (!existingData) {
            throw new TenantNotFoundError(`${tableName} kaydı bulunamadı: ${id}`);
          }
          
          // İzolasyon kontrolü
          assertTenantOwnership(
            tenantId, 
            existingData.tenant_id,
            `Güncellenmeye çalışılan kayıt başka bir tenant'a ait`
          );
          
          // Tenant ID değiştirilmeye çalışılıyorsa engelle
          if (data.tenant_id && data.tenant_id !== tenantId) {
            throw new TenantAccessDeniedError('Tenant ID değiştirilemez');
          }
          
          // Güncelleme işlemini gerçekleştir
          const { data: result, error } = await supabase
            .from(`tenant_${tenantId}.${tableName}`)
            .update(data)
            .eq('id', id)
            .select()
            .single();
            
          if (error) throw error;
          
          return result;
        },
        
        /**
         * Kaydı sil (tenant izolasyonu ile)
         */
        async delete(id: string) {
          // Önce kaydın tenant'a ait olduğunu doğrula
          const { data: existingData } = await supabase
            .from(`tenant_${tenantId}.${tableName}`)
            .select('tenant_id')
            .eq('id', id)
            .single();
            
          if (!existingData) {
            throw new TenantNotFoundError(`${tableName} kaydı bulunamadı: ${id}`);
          }
          
          // İzolasyon kontrolü
          assertTenantOwnership(
            tenantId, 
            existingData.tenant_id,
            `Silinmeye çalışılan kayıt başka bir tenant'a ait`
          );
          
          // Silme işlemini gerçekleştir
          const { error } = await supabase
            .from(`tenant_${tenantId}.${tableName}`)
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          return true;
        },
        
        /**
         * Özel sorgu (tenant izolasyonu ile)
         */
        async customQuery(queryFn: (query: any) => any) {
          const query = supabase.from(`tenant_${tenantId}.${tableName}`);
          const result = await queryFn(query);
          
          if (result.error) throw result.error;
          
          // Sonuçlarda izolasyon kontrolü
          if (Array.isArray(result.data)) {
            return validateTenantResults(tenantId, result.data);
          }
          
          return result.data;
        }
      };
    },
    
    /**
     * Veritabanı işlemi içinde tenant izolasyonu doğrulama
     */
    assertTenantOwnership(resourceTenantId: string | null | undefined, message?: string) {
      assertTenantOwnership(tenantId, resourceTenantId, message);
    }
  };
} 