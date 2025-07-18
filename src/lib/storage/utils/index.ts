// Storage Utility Functions - Comprehensive utilities for file management

// Export new modular utilities
export * from './path-generator';
export * from './file-validator';
export * from './format';

// Re-export commonly used functions for backward compatibility
export { generateStoragePath } from './path-generator';
export { validateFile } from './file-validator';
export { formatFileSize } from './format';

// Legacy functions - maintained for backward compatibility
// These complement the new modular utilities

// Calculate file hash (for deduplication)
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
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
  return (
    '/' +
    segments
      .filter(Boolean)
      .map((s) => s.replace(/^\/+|\/+$/g, ''))
      .join('/')
  );
}
