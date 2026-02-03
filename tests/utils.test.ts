import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, sleep } from '@/lib/utils';

describe('utils', () => {
  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('formats other currencies', () => {
      expect(formatCurrency(100, 'EUR')).toContain('100');
    });
  });

  describe('formatDate', () => {
    it('formats Date objects', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jan');
    });

    it('formats date strings', () => {
      const formatted = formatDate('2024-06-20');
      expect(formatted).toContain('2024');
    });
  });

  describe('sleep', () => {
    it('waits for the specified time', async () => {
      const start = Date.now();
      await sleep(10);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(9);
    });
  });
});
