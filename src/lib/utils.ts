import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn (className) utility fonksiyonu
 * Tailwind sınıf isimlerini birleştirmek için kullanılır
 */
export function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
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
export function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Belirli bir metin aralığını kısaltan yardımcı fonksiyon
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
} 