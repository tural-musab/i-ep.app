import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * CSS sınıflarını birleştirmek için yardımcı fonksiyon
 * 
 * @example
 * cn("p-4", "bg-red-500", true && "text-white", false && "hidden")
 * // "p-4 bg-red-500 text-white"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tailwind sınıflarını birleştiren yardımcı fonksiyon
 */
export function cnOld(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * String formatını kebab-case'e dönüştüren yardımcı fonksiyon
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Tarih formatlamak için yardımcı fonksiyon
 */
export function formatDate(date: Date | string, locale: string = 'tr-TR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Belirli bir metin aralığını kısaltan yardımcı fonksiyon
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Verilen bir metni kısaltmak için kullanılır
 * 
 * @param text Kısaltılacak metin
 * @param maxLength Maksimum uzunluk (varsayılan: 100)
 * @returns Kısaltılmış metin
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Zaman damgasını belirli bir formatta formatlar
 * 
 * @param timestamp Biçimlendirilecek zaman damgası
 * @param includeTime Saat bilgisinin dahil edilip edilmeyeceği
 * @returns Biçimlendirilmiş tarih-saat
 */
export function formatTimestamp(timestamp: string | Date, includeTime: boolean = true): string {
  if (!timestamp) return "";
  
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  
  if (isNaN(date.getTime())) return "Geçersiz Tarih";
  
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  
  return new Intl.DateTimeFormat("tr-TR", options).format(date);
}

/**
 * URL parametrelerinden belirli bir parametreyi alır
 * 
 * @param url URL
 * @param param Alınacak parametre ismi
 * @returns Parametrenin değeri
 */
export function getParameterByName(url: string, param: string): string | null {
  const queryParams = new URLSearchParams(new URL(url).search);
  return queryParams.get(param);
}

/**
 * Telefon numarasını formatlar
 * 
 * @param phoneNumber Formatlanacak telefon numarası
 * @returns Formatlanmış telefon numarası
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "";
  
  // Sadece rakamları al
  const digits = phoneNumber.replace(/\D/g, "");
  
  // Türkiye telefon numarası formatı: +90 (5XX) XXX-XXXX
  if (digits.length === 10) {
    return `+90 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
  }
  
  // Format uygulanamadıysa orijinali döndür
  return phoneNumber;
}

/**
 * Slug oluşturmak için kullanılır
 * 
 * @param text Slug haline getirilecek metin
 * @returns Slug formatında metin
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Alfanümerik olmayan karakterleri kaldır
    .replace(/[\s_-]+/g, "-") // Boşluk, alt çizgi ve tire karakterlerini tek bir tire ile değiştir
    .replace(/^-+|-+$/g, ""); // Baştaki ve sondaki tireleri kaldır
}

/**
 * Değerin belirli bir aralıkta olup olmadığını kontrol eder
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Para birimini formatlar
 */
export function formatCurrency(
  amount: number,
  currency: string = 'TRY',
  locale: string = 'tr-TR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Rastgele bir UUID oluşturur
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Obje içerisindeki null ve undefined değerleri temizler
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * URL'den sorgu parametrelerini alır
 */
export function getQueryParams<T extends Record<string, string>>(url: string): T {
  const params = new URLSearchParams(url.split('?')[1]);
  return Object.fromEntries(params.entries()) as T;
}

/**
 * URL'e sorgu parametrelerini ekler
 */
export function addQueryParams(url: string, params: Record<string, string>): string {
  const urlObj = new URL(url, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });
  return urlObj.toString();
} 