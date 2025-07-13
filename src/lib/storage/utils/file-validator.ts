// File validation utilities
import { UploadOptions } from '@/types/storage';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface FileTypeConfig {
  allowedTypes: string[];
  maxSize: number; // bytes
  minSize?: number; // bytes
}

// Varsayılan dosya türü konfigürasyonları
const DEFAULT_FILE_CONFIGS: Record<string, FileTypeConfig> = {
  image: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 10 * 1024 * 1024, // 10MB
    minSize: 1024 // 1KB
  },
  document: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    minSize: 1024 // 1KB
  },
  video: {
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    maxSize: 500 * 1024 * 1024, // 500MB
    minSize: 10 * 1024 // 10KB
  },
  audio: {
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
    maxSize: 100 * 1024 * 1024, // 100MB
    minSize: 1024 // 1KB
  },
  archive: {
    allowedTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip',
      'application/x-tar'
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    minSize: 1024 // 1KB
  }
};

/**
 * Dosyayı doğrular
 */
export async function validateFile(
  file: File,
  options?: UploadOptions
): Promise<ValidationResult> {
  const warnings: string[] = [];

  try {
    // Temel dosya kontrolü
    if (!file || !file.name) {
      return { isValid: false, error: 'Geçersiz dosya' };
    }

    // Dosya boyutu kontrolü
    const sizeValidation = validateFileSize(file, options);
    if (!sizeValidation.isValid) {
      return sizeValidation;
    }

    // Dosya türü kontrolü
    const typeValidation = validateFileType(file, options);
    if (!typeValidation.isValid) {
      return typeValidation;
    }
    if (typeValidation.warnings) {
      warnings.push(...typeValidation.warnings);
    }

    // Dosya adı kontrolü
    const nameValidation = validateFileName(file.name);
    if (!nameValidation.isValid) {
      return nameValidation;
    }
    if (nameValidation.warnings) {
      warnings.push(...nameValidation.warnings);
    }

    // İçerik kontrolü (opsiyonel)
    if (options?.validateContent !== false) {
      const contentValidation = await validateFileContent(file);
      if (!contentValidation.isValid) {
        return contentValidation;
      }
      if (contentValidation.warnings) {
        warnings.push(...contentValidation.warnings);
      }
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Dosya doğrulama hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    };
  }
}

/**
 * Dosya boyutunu doğrular
 */
export function validateFileSize(
  file: File,
  options?: UploadOptions
): ValidationResult {
  const config = getFileTypeConfig(file.type, options);
  
  if (file.size > config.maxSize) {
    return {
      isValid: false,
      error: `Dosya boyutu çok büyük. Maksimum: ${formatFileSize(config.maxSize)}, 
              Gönderilen: ${formatFileSize(file.size)}`
    };
  }

  if (config.minSize && file.size < config.minSize) {
    return {
      isValid: false,
      error: `Dosya boyutu çok küçük. Minimum: ${formatFileSize(config.minSize)}, 
              Gönderilen: ${formatFileSize(file.size)}`
    };
  }

  return { isValid: true };
}

/**
 * Dosya türünü doğrular
 */
export function validateFileType(
  file: File,
  options?: UploadOptions
): ValidationResult {
  const warnings: string[] = [];
  const config = getFileTypeConfig(file.type, options);

  // MIME type kontrolü
  if (!config.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Desteklenmeyen dosya türü: ${file.type}. 
              İzin verilen türler: ${config.allowedTypes.join(', ')}`
    };
  }

  // Dosya uzantısı kontrolü
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    warnings.push('Dosya uzantısı bulunamadı');
  } else {
    const expectedExtensions = getExpectedExtensions(file.type);
    if (expectedExtensions.length > 0 && !expectedExtensions.includes(extension)) {
      warnings.push(`Beklenmeyen dosya uzantısı: .${extension}. 
                     Beklenen: ${expectedExtensions.map(ext => `.${ext}`).join(', ')}`);
    }
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Dosya adını doğrular
 */
export function validateFileName(fileName: string): ValidationResult {
  const warnings: string[] = [];

  // Boş isim kontrolü
  if (!fileName.trim()) {
    return { isValid: false, error: 'Dosya adı boş olamaz' };
  }

  // Uzunluk kontrolü
  if (fileName.length > 255) {
    return { isValid: false, error: 'Dosya adı çok uzun (maksimum 255 karakter)' };
  }

  // Yasak karakterler
  const forbiddenChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (forbiddenChars.test(fileName)) {
    return { isValid: false, error: 'Dosya adı geçersiz karakterler içeriyor' };
  }

  // Türkçe karakterler uyarısı
  const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
  if (turkishChars.test(fileName)) {
    warnings.push('Dosya adında Türkçe karakter bulundu, URL uyumlu hale getirilecek');
  }

  // Boşluk uyarısı
  if (fileName.includes(' ')) {
    warnings.push('Dosya adındaki boşluklar alt çizgi ile değiştirilecek');
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Dosya içeriğini doğrular (basit kontroller)
 */
export async function validateFileContent(file: File): ValidationResult {
  try {
    // Sadece görüntü dosyaları için temel kontrol
    if (file.type.startsWith('image/')) {
      return await validateImageContent(file);
    }

    // Diğer dosya türleri için şimdilik sadece başarılı dön
    return { isValid: true };

  } catch (error) {
    return {
      isValid: false,
      error: `İçerik doğrulama hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    };
  }
}

/**
 * Görüntü dosyası içeriğini doğrular
 */
async function validateImageContent(file: File): ValidationResult {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const warnings: string[] = [];
      
      // Boyut kontrolü
      if (img.width > 4096 || img.height > 4096) {
        warnings.push(`Görüntü çok büyük: ${img.width}x${img.height}px. Performans sorunları yaşanabilir.`);
      }
      
      resolve({
        isValid: true,
        warnings: warnings.length > 0 ? warnings : undefined
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Görüntü dosyası bozuk veya geçersiz'
      });
    };

    img.src = url;
  });
}

/**
 * Dosya türü konfigürasyonunu alır
 */
function getFileTypeConfig(mimeType: string, options?: UploadOptions): FileTypeConfig {
  // Options'dan özel config varsa kullan
  if (options?.fileTypeConfig) {
    return options.fileTypeConfig;
  }

  // MIME type'a göre kategori belirle
  const category = getFileCategory(mimeType);
  return DEFAULT_FILE_CONFIGS[category] || DEFAULT_FILE_CONFIGS.document;
}

/**
 * MIME type'a göre dosya kategorisini belirler
 */
function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
  return 'document';
}

/**
 * MIME type'a göre beklenen dosya uzantılarını döner
 */
function getExpectedExtensions(mimeType: string): string[] {
  const extensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'image/svg+xml': ['svg'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'text/plain': ['txt'],
    'text/csv': ['csv'],
    'video/mp4': ['mp4'],
    'video/webm': ['webm'],
    'audio/mpeg': ['mp3'],
    'audio/wav': ['wav'],
    'application/zip': ['zip']
  };

  return extensionMap[mimeType] || [];
}

/**
 * Dosya boyutunu okunabilir formata çevirir
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}