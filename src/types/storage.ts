// Storage System Type Definitions

export type StorageProvider = 'supabase' | 'r2' | 's3';
export type FileAccessLevel = 'private' | 'tenant' | 'public';
export type FileStatus = 'active' | 'archived' | 'deleted' | 'quarantined';
export type ShareType = 'user' | 'class' | 'tenant' | 'public';
export type MigrationStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface StorageFile {
  id: string;
  tenant_id: string;
  uploaded_by: string;

  // File metadata
  filename: string;
  original_filename: string;
  mime_type: string | null;
  size_bytes: number;
  file_hash: string | null;

  // Storage info
  storage_provider: StorageProvider;
  storage_path: string;
  storage_bucket: string;
  cdn_url: string | null;

  // Access control
  access_level: FileAccessLevel;
  folder_path: string;

  // Relationships
  related_to_type: string | null;
  related_to_id: string | null;

  // Usage tracking
  access_count: number;
  last_accessed_at: Date | null;

  // Metadata
  metadata: Record<string, any>;

  // Status
  status: FileStatus;

  // Timestamps
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface FileShare {
  id: string;
  file_id: string;
  shared_by: string;
  shared_with_type: ShareType;
  shared_with_id: string | null;

  // Permissions
  can_download: boolean;
  can_view: boolean;
  can_delete: boolean;

  // Share metadata
  expires_at: Date | null;
  access_token: string | null;
  password_hash: string | null;

  // Usage
  access_count: number;
  last_accessed_at: Date | null;

  created_at: Date;
}

export interface FileCategory {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  sort_order: number;
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StorageQuota {
  tenant_id: string;
  total_quota_mb: number;
  used_storage_mb: number;
  max_file_count: number | null;
  current_file_count: number;
  max_file_size_mb: number;
  usage_by_type: Record<string, number>;
  alert_at_percent: number;
  last_alert_sent_at: Date | null;
  updated_at: Date;
}

export interface FileMigration {
  id: string;
  file_id: string;
  from_provider: StorageProvider;
  to_provider: StorageProvider;
  from_path: string;
  to_path: string | null;
  status: MigrationStatus;
  started_at: Date | null;
  completed_at: Date | null;
  error_message: string | null;
  retry_count: number;
  created_at: Date;
}

// Upload types
export interface UploadOptions {
  folder?: string;
  access_level?: FileAccessLevel;
  related_to?: {
    type: string;
    id: string;
  };
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  file: StorageFile;
  url: string;
}

// Storage service interface
export interface IStorageProvider {
  upload(file: File, path: string, options?: UploadOptions): Promise<UploadResult>;
  download(fileId: string): Promise<Blob>;
  delete(fileId: string): Promise<void>;
  getPublicUrl(fileId: string): string;
  getSignedUrl(fileId: string, expiresIn: number): Promise<string>;
  list(folder?: string): Promise<StorageFile[]>;
}

// Error types
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: StorageProvider,
    public originalError?: any
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export const STORAGE_ERROR_CODES = {
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
} as const;

// Utility types
export interface FileFilter {
  mime_types?: string[];
  max_size?: number;
  folder?: string;
  status?: FileStatus;
  uploaded_by?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface StorageStats {
  total_files: number;
  total_size: number;
  by_type: Record<string, { count: number; size: number }>;
  by_provider: Record<StorageProvider, { count: number; size: number }>;
}

// Path utilities
export interface PathConfig {
  tenantId: string;
  userId: string;
  year: number;
  month: number;
  category?: string;
}

// Share link types
export interface CreateShareOptions {
  type: ShareType;
  targetId?: string;
  expiresIn?: number; // seconds
  password?: string;
  permissions?: {
    download?: boolean;
    view?: boolean;
    delete?: boolean;
  };
}

export interface ShareLink {
  url: string;
  token: string;
  expires_at: Date | null;
  password_protected: boolean;
}
