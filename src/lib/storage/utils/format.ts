// File formatting utilities

/**
 * Dosya boyutunu okunabilir formata çevirir
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${size} ${sizes[i]}`;
}

/**
 * Dosya türünü Türkçe açıklama olarak döner
 */
export function getFileTypeDescription(mimeType: string): string {
  const typeMap: Record<string, string> = {
    // Images
    'image/jpeg': 'JPEG Görüntü',
    'image/jpg': 'JPEG Görüntü',
    'image/png': 'PNG Görüntü',
    'image/gif': 'GIF Animasyon',
    'image/webp': 'WebP Görüntü',
    'image/svg+xml': 'SVG Vektör',
    'image/bmp': 'BMP Görüntü',
    'image/tiff': 'TIFF Görüntü',

    // Documents
    'application/pdf': 'PDF Doküman',
    'application/msword': 'Word Doküman',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Doküman (DOCX)',
    'application/vnd.ms-excel': 'Excel Dosyası',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Dosyası (XLSX)',
    'application/vnd.ms-powerpoint': 'PowerPoint Sunumu',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Sunumu (PPTX)',
    'text/plain': 'Metin Dosyası',
    'text/csv': 'CSV Dosyası',
    'text/html': 'HTML Dosyası',
    'text/css': 'CSS Dosyası',
    'text/javascript': 'JavaScript Dosyası',
    'application/json': 'JSON Dosyası',
    'application/xml': 'XML Dosyası',

    // Archives
    'application/zip': 'ZIP Arşivi',
    'application/x-rar-compressed': 'RAR Arşivi',
    'application/x-7z-compressed': '7-Zip Arşivi',
    'application/gzip': 'GZIP Arşivi',
    'application/x-tar': 'TAR Arşivi',

    // Audio
    'audio/mpeg': 'MP3 Ses',
    'audio/wav': 'WAV Ses',
    'audio/ogg': 'OGG Ses',
    'audio/m4a': 'M4A Ses',
    'audio/aac': 'AAC Ses',
    'audio/flac': 'FLAC Ses',

    // Video
    'video/mp4': 'MP4 Video',
    'video/webm': 'WebM Video',
    'video/ogg': 'OGG Video',
    'video/avi': 'AVI Video',
    'video/mov': 'MOV Video',
    'video/wmv': 'WMV Video',
    'video/flv': 'FLV Video',
    'video/mkv': 'MKV Video'
  };

  return typeMap[mimeType] || getGenericTypeDescription(mimeType);
}

/**
 * Genel dosya türü açıklaması
 */
function getGenericTypeDescription(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'Görüntü Dosyası';
  if (mimeType.startsWith('video/')) return 'Video Dosyası';
  if (mimeType.startsWith('audio/')) return 'Ses Dosyası';
  if (mimeType.startsWith('text/')) return 'Metin Dosyası';
  if (mimeType.includes('application/')) return 'Uygulama Dosyası';
  return 'Bilinmeyen Dosya Türü';
}

/**
 * Dosya türü ikonunu döner (CSS class veya icon name)
 */
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'file-image';
  if (mimeType.startsWith('video/')) return 'file-video';
  if (mimeType.startsWith('audio/')) return 'file-audio';
  if (mimeType === 'application/pdf') return 'file-pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'file-archive';
  if (mimeType.startsWith('text/')) return 'file-text';
  return 'file';
}

/**
 * Tarih formatını Türkçe formata çevirir
 */
export function formatDateTurkish(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Relatif zaman formatı (örn: "2 saat önce")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} yıl önce`;
  if (months > 0) return `${months} ay önce`;
  if (weeks > 0) return `${weeks} hafta önce`;
  if (days > 0) return `${days} gün önce`;
  if (hours > 0) return `${hours} saat önce`;
  if (minutes > 0) return `${minutes} dakika önce`;
  if (seconds > 30) return `${seconds} saniye önce`;
  return 'Az önce';
}

/**
 * Dosya erişim seviyesini Türkçe açıklar
 */
export function formatAccessLevel(accessLevel: string): string {
  const accessMap: Record<string, string> = {
    'private': 'Özel',
    'tenant': 'Kurum İçi', 
    'public': 'Herkese Açık'
  };

  return accessMap[accessLevel] || accessLevel;
}

/**
 * Dosya durumunu Türkçe açıklar
 */
export function formatFileStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Aktif',
    'archived': 'Arşivlenmiş',
    'deleted': 'Silinmiş',
    'quarantined': 'Karantinada'
  };

  return statusMap[status] || status;
}

/**
 * Depolama sağlayıcı adını formatlar
 */
export function formatStorageProvider(provider: string): string {
  const providerMap: Record<string, string> = {
    'supabase': 'Supabase Storage',
    'r2': 'Cloudflare R2',
    's3': 'Amazon S3'
  };

  return providerMap[provider] || provider;
}

/**
 * İndirme linki oluşturur
 */
export function generateDownloadUrl(fileId: string): string {
  return `/api/storage/download/${fileId}`;
}

/**
 * Önizleme linki oluşturur
 */
export function generatePreviewUrl(fileId: string): string {
  return `/api/storage/preview/${fileId}`;
}

/**
 * Dosya paylaşım linkini oluşturur
 */
export function generateShareUrl(fileId: string, token?: string): string {
  const baseUrl = `/api/storage/share/${fileId}`;
  return token ? `${baseUrl}?token=${token}` : baseUrl;
}

/**
 * Breadcrumb path'ini oluşturur
 */
export function formatBreadcrumbPath(folderPath: string): Array<{name: string, path: string}> {
  if (!folderPath || folderPath === '/') {
    return [{ name: 'Ana Klasör', path: '/' }];
  }

  const parts = folderPath.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Ana Klasör', path: '/' }];

  let currentPath = '';
  parts.forEach(part => {
    currentPath += `/${part}`;
    breadcrumbs.push({
      name: part,
      path: currentPath
    });
  });

  return breadcrumbs;
}