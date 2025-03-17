import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS sınıflarını birleştirmek için yardımcı fonksiyon
 * clsx ve tailwind-merge kullanarak dinamik sınıf birleştirme yapar
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Metinleri belirli bir uzunlukta kesmek için kullanılır
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Tarihi istenen formatta biçimlendirir
 */
export function formatDate(date: Date | string, locale: string = 'tr-TR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Para birimini biçimlendirir
 */
export function formatCurrency(amount: number, currency: string = 'TRY', locale: string = 'tr-TR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Rasgele benzersiz ID oluşturur
 */
export function generateUniqueId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
} 