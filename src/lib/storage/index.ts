// Main Storage Service
// This is the entry point for all storage operations

import { SupabaseStorageProvider } from './providers/supabase.provider';
import { CloudflareR2Provider } from './providers/cloudflare-r2.provider';
import { StorageRepository } from './repository/storage-repository';
import type { IStorageProvider, StorageProvider, UploadOptions, UploadResult, StorageFile } from '@/types/storage';

// Storage configuration from environment
const STORAGE_CONFIG = {
  primaryProvider: (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase') as StorageProvider,
  
  // Size-based routing (for future use)
  routing: {
    maxSupabaseFileSize: 10 * 1024 * 1024, // 10MB
    largeFileProvider: 'r2' as StorageProvider,
  },
  
  // Feature flags
  features: {
    useCloudflareR2: process.env.NEXT_PUBLIC_USE_R2 === 'true',
    routeLargeFiles: process.env.NEXT_PUBLIC_ROUTE_LARGE_FILES === 'true',
  }
};

/**
 * Main Storage Service
 * Handles provider selection and routing
 */
export class StorageService implements IStorageProvider {
  private providers: Map<StorageProvider, IStorageProvider>;
  
  constructor() {
    this.providers = new Map();
    
    // Initialize providers
    this.providers.set('supabase', new SupabaseStorageProvider());
    
    // Only initialize R2 if enabled
    if (STORAGE_CONFIG.features.useCloudflareR2) {
      this.providers.set('r2', new CloudflareR2Provider());
    }
  }
  
  /**
   * Get the appropriate provider for a file
   */
  private getProvider(file?: File): IStorageProvider {
    // If R2 is not enabled, always use Supabase
    if (!STORAGE_CONFIG.features.useCloudflareR2) {
      return this.providers.get('supabase')!;
    }
    
    // Route large files to R2 if enabled
    if (file && STORAGE_CONFIG.features.routeLargeFiles) {
      if (file.size > STORAGE_CONFIG.routing.maxSupabaseFileSize) {
        const r2Provider = this.providers.get('r2');
        if (r2Provider) return r2Provider;
      }
    }
    
    // Default to primary provider
    return this.providers.get(STORAGE_CONFIG.primaryProvider)!;
  }
  
  /**
   * Upload a file
   */
  async upload(file: File, path: string, options?: UploadOptions): Promise<UploadResult> {
    const provider = this.getProvider(file);
    return provider.upload(file, path, options);
  }
  
  /**
   * Download a file
   */
  async download(fileId: string): Promise<Blob> {
    // First, get file info from database to know which provider
    const file = await this.getFileInfo(fileId);
    const provider = this.providers.get(file.storage_provider)!;
    return provider.download(fileId);
  }
  
  /**
   * Delete a file
   */
  async delete(fileId: string): Promise<void> {
    const file = await this.getFileInfo(fileId);
    const provider = this.providers.get(file.storage_provider)!;
    return provider.delete(fileId);
  }
  
  /**
   * Get public URL for a file
   */
  getPublicUrl(fileId: string): string {
    // This is synchronous, so we'll need to handle it differently
    // For now, return a URL that will be resolved by our API
    return `/api/storage/files/${fileId}`;
  }
  
  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(fileId: string, expiresIn: number): Promise<string> {
    const file = await this.getFileInfo(fileId);
    const provider = this.providers.get(file.storage_provider)!;
    return provider.getSignedUrl(fileId, expiresIn);
  }
  
  /**
   * List files in a folder
   */
  async list(folder?: string): Promise<StorageFile[]> {
    // Bu database'i sorgulamalı, storage provider'ı değil
    // Implementasyon repository katmanında olacak
    throw new Error('StorageRepository.list() metodunu kullanın');
  }
  
  /**
   * Get file information from database
   */
  private async getFileInfo(fileId: string): Promise<StorageFile> {
    // Bu repository katmanında implement edilecek
    // Şimdilik hata fırlat
    throw new Error('StorageRepository henüz implement edilmedi');
  }
  
  /**
   * Check if a file should be migrated to R2
   */
  async shouldMigrateToR2(fileId: string): Promise<boolean> {
    if (!STORAGE_CONFIG.features.useCloudflareR2) return false;
    
    const file = await this.getFileInfo(fileId);
    
    // Already on R2
    if (file.storage_provider === 'r2') return false;
    
    // Check size threshold
    if (file.size_bytes > STORAGE_CONFIG.routing.maxSupabaseFileSize) {
      return true;
    }
    
    // Check if it's a frequently accessed file
    if (file.access_count > 100) {
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const storage = new StorageService();

// Export utility functions
export { generateStoragePath } from './utils/path-generator';
export { validateFile } from './utils/file-validator';
export { formatFileSize } from './utils/format';

// Re-export types
export type {
  IStorageProvider,
  StorageFile,
  UploadOptions,
  UploadResult,
  FileShare,
  FileCategory,
  StorageQuota,
} from '@/types/storage';