// @ts-nocheck
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn('base-class', isActive && 'active-class', isDisabled && 'disabled-class');

    expect(result).toBe('base-class active-class');
  });

  it('should merge conflicting Tailwind classes', () => {
    const result = cn('px-4 py-2', 'px-8');
    expect(result).toBe('py-2 px-8');
  });

  it('should handle array of classes', () => {
    const result = cn(['text-sm', 'font-bold'], 'text-lg');
    expect(result).toBe('font-bold text-lg');
  });

  it('should handle object notation', () => {
    const result = cn({
      'text-red-500': true,
      'text-blue-500': false,
      'font-bold': true,
    });

    expect(result).toBe('text-red-500 font-bold');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('should handle empty strings', () => {
    const result = cn('', 'text-sm', '');
    expect(result).toBe('text-sm');
  });

  it('should handle complex tailwind merging', () => {
    const result = cn('rounded-md rounded-xl', 'p-4 p-6', 'text-gray-500 text-blue-600');

    expect(result).toBe('rounded-xl p-6 text-blue-600');
  });

  it('should preserve non-tailwind classes', () => {
    const result = cn('custom-class', 'text-sm', 'another-custom');
    expect(result).toBe('custom-class text-sm another-custom');
  });

  it('should handle no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
