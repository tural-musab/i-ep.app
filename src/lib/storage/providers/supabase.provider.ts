// Supabase Storage Provider Implementation

import { createClient } from '@/lib/supabase/client';
import type {
  IStorageProvider,
  UploadOptions,
  UploadResult,
  StorageFile,
  StorageError,
} from '@/types/storage';
import { STORAGE_ERROR_CODES } from '@/types/storage';
import { generateStoragePath } from '../utils/path-generator';
import { validateFile } from '../utils/file-validator';

export class SupabaseStorageProvider implements IStorageProvider {
  private supabase = createClient();
  private bucket = 'files'; // Default bucket name

  async upload(file: File, path: string, options?: UploadOptions): Promise<UploadResult> {
    try {
      // Validate file
      const validation = await validateFile(file, options);
      if (!validation.isValid) {
        throw new StorageError(
          validation.error!,
          STORAGE_ERROR_CODES.INVALID_FILE_TYPE,
          'supabase'
        );
      }

      // Check quota
      await this.checkQuota(file.size);

      // Generate unique path
      const storagePath = path || (await generateStoragePath(file, options));

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new StorageError(
          'Failed to upload file to Supabase',
          STORAGE_ERROR_CODES.UPLOAD_FAILED,
          'supabase',
          error
        );
      }

      // Create file record in database
      const fileRecord = await this.createFileRecord(file, storagePath, options);

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(this.bucket).getPublicUrl(storagePath);

      return {
        file: fileRecord,
        url: publicUrl,
      };
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        'Unexpected error during upload',
        STORAGE_ERROR_CODES.UPLOAD_FAILED,
        'supabase',
        error
      );
    }
  }

  async download(fileId: string): Promise<Blob> {
    try {
      // Get file info from database
      const file = await this.getFileRecord(fileId);

      // Download from Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .download(file.storage_path);

      if (error) {
        throw new StorageError(
          'Failed to download file',
          STORAGE_ERROR_CODES.DOWNLOAD_FAILED,
          'supabase',
          error
        );
      }

      // Update access count
      await this.updateAccessCount(fileId);

      return data;
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        'Unexpected error during download',
        STORAGE_ERROR_CODES.DOWNLOAD_FAILED,
        'supabase',
        error
      );
    }
  }

  async delete(fileId: string): Promise<void> {
    try {
      // Get file info
      const file = await this.getFileRecord(fileId);

      // Check permissions
      const canDelete = await this.checkDeletePermission(fileId);
      if (!canDelete) {
        throw new StorageError(
          'Permission denied',
          STORAGE_ERROR_CODES.PERMISSION_DENIED,
          'supabase'
        );
      }

      // Delete from Supabase Storage
      const { error } = await this.supabase.storage.from(this.bucket).remove([file.storage_path]);

      if (error) {
        throw new StorageError(
          'Failed to delete file',
          STORAGE_ERROR_CODES.DELETE_FAILED,
          'supabase',
          error
        );
      }

      // Soft delete in database
      await this.softDeleteFileRecord(fileId);
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        'Unexpected error during deletion',
        STORAGE_ERROR_CODES.DELETE_FAILED,
        'supabase',
        error
      );
    }
  }

  getPublicUrl(fileId: string): string {
    // This needs to be async to get file info, but interface requires sync
    // Return API endpoint that will resolve the actual URL
    return `/api/storage/public/${fileId}`;
  }

  async getSignedUrl(fileId: string, expiresIn: number): Promise<string> {
    try {
      const file = await this.getFileRecord(fileId);

      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .createSignedUrl(file.storage_path, expiresIn);

      if (error) {
        throw new StorageError(
          'Failed to create signed URL',
          STORAGE_ERROR_CODES.PROVIDER_ERROR,
          'supabase',
          error
        );
      }

      return data.signedUrl;
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        'Unexpected error creating signed URL',
        STORAGE_ERROR_CODES.PROVIDER_ERROR,
        'supabase',
        error
      );
    }
  }

  async list(folder?: string): Promise<StorageFile[]> {
    // Bu repository katmanı tarafından handle edilmeli
    throw new Error('StorageRepository.list() metodunu kullanın');
  }

  // Private helper methods

  private async checkQuota(fileSize: number): Promise<void> {
    const { data: quota, error } = await this.supabase.from('storage_quotas').select('*').single();

    if (error) throw error;

    if (!quota) return; // No quota set

    // Check file size limit
    if (fileSize > quota.max_file_size_mb * 1024 * 1024) {
      throw new StorageError(
        `File size exceeds limit of ${quota.max_file_size_mb}MB`,
        STORAGE_ERROR_CODES.FILE_TOO_LARGE,
        'supabase'
      );
    }

    // Check total storage limit
    const newUsage = quota.used_storage_mb + fileSize / 1024 / 1024;
    if (newUsage > quota.total_quota_mb) {
      throw new StorageError(
        'Storage quota exceeded',
        STORAGE_ERROR_CODES.QUOTA_EXCEEDED,
        'supabase'
      );
    }
  }

  private async createFileRecord(
    file: File,
    storagePath: string,
    options?: UploadOptions
  ): Promise<StorageFile> {
    const { data: user } = await this.supabase.auth.getUser();

    const fileData = {
      filename: file.name,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      storage_provider: 'supabase',
      storage_path: storagePath,
      storage_bucket: this.bucket,
      folder_path: options?.folder || '/',
      access_level: options?.access_level || 'private',
      uploaded_by: user?.user?.id,
      related_to_type: options?.related_to?.type,
      related_to_id: options?.related_to?.id,
      metadata: options?.metadata || {},
    };

    const { data, error } = await this.supabase.from('files').insert(fileData).select().single();

    if (error) throw error;

    return data;
  }

  private async getFileRecord(fileId: string): Promise<StorageFile> {
    const { data, error } = await this.supabase.from('files').select('*').eq('id', fileId).single();

    if (error) {
      throw new StorageError(
        'File not found',
        STORAGE_ERROR_CODES.FILE_NOT_FOUND,
        'supabase',
        error
      );
    }

    return data;
  }

  private async updateAccessCount(fileId: string): Promise<void> {
    await this.supabase.rpc('increment_file_access', { file_id: fileId });
  }

  private async checkDeletePermission(fileId: string): Promise<boolean> {
    // This would check RLS policies
    // For now, return true (handled by RLS)
    return true;
  }

  private async softDeleteFileRecord(fileId: string): Promise<void> {
    await this.supabase
      .from('files')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', fileId);
  }
}
