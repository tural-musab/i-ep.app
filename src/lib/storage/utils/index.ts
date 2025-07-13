// Storage Utility Functions

import { v4 as uuidv4 } from 'uuid';
import type { UploadOptions } from '@/types/storage';

// Path Generator
export function generateStoragePath(file: File, options?: UploadOptions): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get tenant ID from context (this would come from your auth context)
  const tenantId = options?.metadata?.tenantId || 'default';
  
  // Sanitize filename
  const sanitizedName = sanitizeFilename(file.name);
  
  // Generate unique filename
  const uniqueId = uuidv4();
  const extension = getFileExtension(file.name);
  const filename = `${uniqueId}-${sanitizedName}`;
  
  // Build path: tenants/{tenantId}/files/{year}/{month}/{filename}
  const path = `tenants/${tenantId}/files/${year}/${month}/${filename}`;
  
  return path;
}

// File Validator
export async function validateFile(
  file: File,
  options?: UploadOptions
): Promise<{ isValid: boolean; error?: string }> {
  // Check file size (100MB default max)
  const maxSize = options?.metadata?.maxSize || 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum of ${formatFileSize(maxSize)}`,
    };
  }
  
  // Check allowed mime types
  const allowedTypes = options?.metadata?.allowedTypes || [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/*',
    'video/mp4',
    'video/mpeg',
    'audio/*',
  ];
  
  const isAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.slice(0, -2);
      return file.type.startsWith(category);
    }
    return file.type === type;
  });
  
  if (!isAllowed) {
    return {
      isValid: false,
      error: 'File type not allowed',
    };
  }
  
  // Check for malicious files
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs'];
  const extension = getFileExtension(file.name).toLowerCase();
  if (dangerousExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'Potentially dangerous file type',
    };
  }
  
  return { isValid: true };
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove special characters but keep dots for extensions
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

// Get file extension
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts.pop()}` : '';
}

// Get mime type category
export function getMimeCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.startsWith('text/')) return 'text';
  return 'other';
}

// Get file icon based on mime type
export function getFileIcon(mimeType: string): string {
  const category = getMimeCategory(mimeType);
  
  const iconMap: Record<string, string> = {
    image: 'image',
    video: 'video',
    audio: 'music',
    pdf: 'file-text',
    document: 'file-text',
    spreadsheet: 'table',
    presentation: 'presentation',
    text: 'file-text',
    other: 'file',
  };
  
  return iconMap[category] || 'file';
}

// Calculate file hash (for deduplication)
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Check if file is an image
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

// Check if file is a video
export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

// Generate thumbnail path
export function getThumbnailPath(originalPath: string): string {
  const parts = originalPath.split('/');
  const filename = parts.pop()!;
  const thumbnailName = `thumb_${filename}`;
  return [...parts, 'thumbnails', thumbnailName].join('/');
}

// Parse storage path
export function parseStoragePath(path: string): {
  tenantId: string;
  year: string;
  month: string;
  filename: string;
} {
  const parts = path.split('/');
  // Expected format: tenants/{tenantId}/files/{year}/{month}/{filename}
  
  return {
    tenantId: parts[1],
    year: parts[3],
    month: parts[4],
    filename: parts[5],
  };
}

// Build folder path
export function buildFolderPath(...segments: string[]): string {
  return '/' + segments
    .filter(Boolean)
    .map(s => s.replace(/^\/+|\/+$/g, ''))
    .join('/');
}