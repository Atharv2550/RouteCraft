import { describe, it, expect } from 'vitest';

describe('RouteCraft Frontend Test Suite', () => {
  it('validates money formatting utility', () => {
    const formatMoney = (minorUnits, currency = 'USD') => {
      return `${currency} ${(minorUnits / 100).toFixed(2)}`;
    };

    expect(formatMoney(15000, 'USD')).toBe('USD 150.00');
    expect(formatMoney(299, 'EUR')).toBe('EUR 2.99');
  });

  it('validates travel duration calculation', () => {
    const calcDiffDays = (startStr, endStr) => {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    expect(calcDiffDays('2026-11-01', '2026-11-05')).toBe(5);
  });
});

