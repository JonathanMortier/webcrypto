import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatLargeNumber,
  getChangeClass,
  getChangeSign,
  formatTime,
} from '../core/utils.js';

describe('formatPrice', () => {
  it('should format price >= 1 with 2 decimal places', () => {
    expect(formatPrice(1)).toBe('1.00');
    expect(formatPrice(1234.56)).toBe('1,234.56');
    expect(formatPrice(50000)).toBe('50,000.00');
  });

  it('should format price < 1 with 4-6 decimal places', () => {
    expect(formatPrice(0.5)).toBe('0.5000');
    expect(formatPrice(0.123456)).toBe('0.123456');
    expect(formatPrice(0.0000123)).toBe('0.000012');
  });
});

describe('formatLargeNumber', () => {
  it('should format trillions', () => {
    expect(formatLargeNumber(1e12)).toBe('1.00T');
    expect(formatLargeNumber(1.5e12)).toBe('1.50T');
  });

  it('should format billions', () => {
    expect(formatLargeNumber(1e9)).toBe('1.00B');
    expect(formatLargeNumber(2.5e9)).toBe('2.50B');
  });

  it('should format millions', () => {
    expect(formatLargeNumber(1e6)).toBe('1.00M');
    expect(formatLargeNumber(5.75e6)).toBe('5.75M');
  });

  it('should format smaller numbers with locale', () => {
    expect(formatLargeNumber(500000)).toBe('500,000');
  });
});

describe('getChangeClass', () => {
  it('should return positive for change >= 0', () => {
    expect(getChangeClass(0)).toBe('positive');
    expect(getChangeClass(5)).toBe('positive');
  });

  it('should return negative for change < 0', () => {
    expect(getChangeClass(-1)).toBe('negative');
    expect(getChangeClass(-10.5)).toBe('negative');
  });
});

describe('getChangeSign', () => {
  it('should return + for positive change', () => {
    expect(getChangeSign(0)).toBe('+');
    expect(getChangeSign(1)).toBe('+');
  });
});

describe('formatTime', () => {
  it('should format time in French locale', () => {
    const date = new Date('2024-01-01T12:00:00');
    const formatted = formatTime(date);
    expect(formatted).toContain('12:00:00');
  });

  it('should default to current time', () => {
    const result = formatTime();
    expect(result).toBeDefined();
  });
});