import { getTenantSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { StorageFile, FileAccessLevel, FileStatus, ShareType } from '@/types/storage';

export type InsertStorageFile = Database['public']['Tables']['files']['Insert'];
export type UpdateStorageFile = Database['public']['Tables']['files']['Update'];

export interface FileListOptions {
  folder?: string;
  access_level?: FileAccessLevel;
  status?: FileStatus;
  related_to_type?: string;
  related_to_id?: string;
  limit?: number;
  offset?: number;
  uploaded_by?: string;
}

export interface FileShareOptions {
  shared_with_type: ShareType;
  shared_with_id?: string;
  permission: 'read' | 'write';
  expires_at?: Date;
}

export class StorageRepository {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Dosya bilgilerini veritabanından getirir
   */
  async getById(fileId: string): Promise<StorageFile | null> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Dosya bulunamadı
      }
      console.error('Dosya getirilirken hata oluştu:', error);
      throw new Error(`Dosya getirilirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Dosya listesini getirir
   */
  async list(options: FileListOptions = {}): Promise<StorageFile[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    let query = supabase
      .from('files')
      .select('*')
      .eq('status', options.status || 'active')
      .order('created_at', { ascending: false });

    // Filtreler
    if (options.folder) {
      query = query.eq('folder_path', options.folder);
    }

    if (options.access_level) {
      query = query.eq('access_level', options.access_level);
    }

    if (options.related_to_type) {
      query = query.eq('related_to_type', options.related_to_type);
    }

    if (options.related_to_id) {
      query = query.eq('related_to_id', options.related_to_id);
    }

    if (options.uploaded_by) {
      query = query.eq('uploaded_by', options.uploaded_by);
    }

    // Pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Dosyalar getirilirken hata oluştu:', error);
      throw new Error(`Dosyalar getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Yeni dosya kaydı oluşturur
   */
  async create(fileData: InsertStorageFile): Promise<StorageFile> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    const { data, error } = await supabase
      .from('files')
      .insert({
        ...fileData,
        tenant_id: this.tenantId,
        status: 'active',
        access_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Dosya kaydı oluşturulurken hata oluştu:', error);
      throw new Error(`Dosya kaydı oluşturulurken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Dosya bilgilerini günceller
   */
  async update(fileId: string, updates: UpdateStorageFile): Promise<StorageFile> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    const { data, error } = await supabase
      .from('files')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId)
      .eq('status', 'active')
      .select()
      .single();

    if (error) {
      console.error('Dosya güncellenirken hata oluştu:', error);
      throw new Error(`Dosya güncellenirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Dosyayı soft delete yapar
   */
  async softDelete(fileId: string): Promise<void> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    const { error } = await supabase
      .from('files')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId);

    if (error) {
      console.error('Dosya silinirken hata oluştu:', error);
      throw new Error(`Dosya silinirken hata oluştu: ${error.message}`);
    }
  }

  /**
   * Dosya erişim sayısını artırır
   */
  async incrementAccessCount(fileId: string): Promise<void> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    const { error } = await supabase.rpc('increment_file_access', {
      file_id: fileId,
    });

    if (error) {
      console.error('Erişim sayısı güncellenirken hata oluştu:', error);
      // Bu kritik olmayan bir hata, throw yapmıyoruz
    }
  }

  /**
   * Dosya paylaşımı oluşturur
   */
  async createShare(
    fileId: string,
    shareOptions: FileShareOptions,
    sharedBy: string
  ): Promise<void> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    const { error } = await supabase.from('file_shares').insert({
      file_id: fileId,
      shared_by: sharedBy,
      shared_with_type: shareOptions.shared_with_type,
      shared_with_id: shareOptions.shared_with_id,
      can_download: shareOptions.permission === 'write' || shareOptions.permission === 'read',
      can_view: true,
      can_delete: shareOptions.permission === 'write',
      expires_at: shareOptions.expires_at?.toISOString(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Dosya paylaşımı oluşturulurken hata oluştu:', error);
      throw new Error(`Dosya paylaşımı oluşturulurken hata oluştu: ${error.message}`);
    }
  }

  /**
   * Kullanıcının dosyaya erişim iznini kontrol eder
   */
  async checkAccess(fileId: string, userId: string): Promise<boolean> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    // Önce dosyanın sahibi mi kontrol et
    const { data: file } = await supabase
      .from('files')
      .select('uploaded_by, access_level')
      .eq('id', fileId)
      .eq('status', 'active')
      .single();

    if (!file) return false;

    // Dosya sahibi ise erişim var
    if (file.uploaded_by === userId) return true;

    // Public dosya ise erişim var
    if (file.access_level === 'public') return true;

    // Tenant level dosya ise tenant üyesi olarak erişim var
    if (file.access_level === 'tenant') return true;

    // Paylaşım kontrolü
    const { data: shares } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', fileId)
      .or(`shared_with_id.eq.${userId},shared_with_type.eq.tenant`)
      .or('expires_at.is.null,expires_at.gt.now()')
      .limit(1);

    return (shares && shares.length > 0) || false;
  }

  /**
   * Dosya istatistiklerini getirir
   */
  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    filesByAccessLevel: Record<string, number>;
  }> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    // Toplam dosya sayısı ve boyutu
    const { data: stats } = await supabase
      .from('files')
      .select('size_bytes, mime_type, access_level')
      .eq('status', 'active');

    if (!stats) {
      return {
        totalFiles: 0,
        totalSize: 0,
        filesByType: {},
        filesByAccessLevel: {},
      };
    }

    const totalFiles = stats.length;
    const totalSize = stats.reduce((sum, file) => sum + (file.size_bytes || 0), 0);

    // Dosya türlerine göre grupla
    const filesByType: Record<string, number> = {};
    const filesByAccessLevel: Record<string, number> = {};

    stats.forEach((file) => {
      const type = file.mime_type?.split('/')[0] || 'unknown';
      filesByType[type] = (filesByType[type] || 0) + 1;

      filesByAccessLevel[file.access_level] = (filesByAccessLevel[file.access_level] || 0) + 1;
    });

    return {
      totalFiles,
      totalSize,
      filesByType,
      filesByAccessLevel,
    };
  }

  /**
   * Kullanıcının quota kullanımını getirir
   */
  async getUserQuotaUsage(userId: string): Promise<{
    usedBytes: number;
    fileCount: number;
  }> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    const { data: files } = await supabase
      .from('files')
      .select('size_bytes')
      .eq('uploaded_by', userId)
      .eq('status', 'active');

    if (!files) {
      return { usedBytes: 0, fileCount: 0 };
    }

    const usedBytes = files.reduce((sum, file) => sum + (file.size_bytes || 0), 0);
    const fileCount = files.length;

    return { usedBytes, fileCount };
  }
}
