// Storage path generator utilities
import { UploadOptions } from '@/types/storage';

/**
 * Dosya için storage path oluşturur
 */
export async function generateStoragePath(file: File, options?: UploadOptions): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Dosya adını temizle
  const cleanFileName = sanitizeFileName(file.name);

  // Unique identifier ekle
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const uniqueId = `${timestamp}_${random}`;

  // Dosya uzantısını al
  const extension = getFileExtension(cleanFileName);
  const nameWithoutExt = removeFileExtension(cleanFileName);

  // Final dosya adı
  const finalFileName = `${nameWithoutExt}_${uniqueId}${extension}`;

  // Folder path oluştur
  const basePath = options?.folder || 'uploads';
  const datePath = `${year}/${month}/${day}`;

  // İlişkili entity varsa klasöre ekle
  let categoryPath = '';
  if (options?.related_to?.type) {
    categoryPath = `/${options.related_to.type}`;
    if (options.related_to.id) {
      categoryPath += `/${options.related_to.id}`;
    }
  }

  return `${basePath}/${datePath}${categoryPath}/${finalFileName}`;
}

/**
 * Dosya adını temizler (güvenli karakterler)
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Accent karakterleri kaldır
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Güvenli olmayan karakterleri _ ile değiştir
    .replace(/_{2,}/g, '_') // Çoklu _ leri tek _ yap
    .replace(/^_+|_+$/g, '') // Başta ve sonda _ kaldır
    .toLowerCase();
}

/**
 * Dosya uzantısını alır
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1 || lastDot === fileName.length - 1) {
    return '';
  }
  return fileName.substring(lastDot);
}

/**
 * Dosya adından uzantıyı kaldırır
 */
export function removeFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return fileName;
  }
  return fileName.substring(0, lastDot);
}

/**
 * Public URL path oluşturur
 */
export function generatePublicPath(tenantId: string, fileName: string, folder?: string): string {
  const basePath = folder || 'public';
  return `${tenantId}/${basePath}/${fileName}`;
}

/**
 * CDN URL oluşturur (gelecek R2 entegrasyonu için)
 */
export function generateCdnUrl(
  storagePath: string,
  provider: 'supabase' | 'r2' = 'supabase'
): string {
  switch (provider) {
    case 'r2':
      // Cloudflare R2 CDN URL format
      const cdnDomain = process.env.CLOUDFLARE_R2_CDN_DOMAIN;
      return cdnDomain ? `https://${cdnDomain}/${storagePath}` : '';

    case 'supabase':
    default:
      // Supabase Storage URL format
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const projectId = supabaseUrl?.split('://')[1]?.split('.')[0];
      return projectId ? `${supabaseUrl}/storage/v1/object/public/files/${storagePath}` : '';
  }
}
