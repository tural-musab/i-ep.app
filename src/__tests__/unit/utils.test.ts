// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { cn } from '@/lib/utils';

describe('Utils Tests', () => {
  describe('cn function', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toBe('base conditional');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toBe('base end');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('p-4', 'p-2'); // p-2 should override p-4
      expect(result).toContain('p-2');
      expect(result).not.toContain('p-4');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle array inputs', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });
  });
});
