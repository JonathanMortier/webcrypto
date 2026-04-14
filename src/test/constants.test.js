import { describe, it, expect } from 'vitest';
import {
  STABLECOINS,
  XSTOCK_IDS,
  API_URL,
  XSTOCKS_API_URL,
  REFRESH_INTERVAL,
  CACHE_TTL,
} from '../core/constants.js';

describe('STABLECOINS', () => {
  it('should be an array', () => {
    expect(Array.isArray(STABLECOINS)).toBe(true);
  });

  it('should contain common stablecoins', () => {
    expect(STABLECOINS).toContain('usdt');
    expect(STABLECOINS).toContain('usdc');
    expect(STABLECOINS).toContain('dai');
  });
});

describe('XSTOCK_IDS', () => {
  it('should be an array of xstock IDs', () => {
    expect(Array.isArray(XSTOCK_IDS)).toBe(true);
  });

  it('should contain major tech stocks', () => {
    expect(XSTOCK_IDS).toContain('apple-xstock');
    expect(XSTOCK_IDS).toContain('microsoft-xstock');
    expect(XSTOCK_IDS).toContain('nvidia-xstock');
  });
});

describe('API_URL', () => {
  it('should be a valid URL string', () => {
    expect(API_URL).toContain('coingecko.com');
    expect(API_URL).toContain('coins/markets');
  });
});

describe('XSTOCKS_API_URL', () => {
  it('should generate URL with provided IDs', () => {
    const ids = 'bitcoin,ethereum';
    const url = XSTOCKS_API_URL(ids);
    expect(url).toContain(ids);
    expect(url).toContain('coingecko.com');
  });
});

describe('REFRESH_INTERVAL', () => {
  it('should be a positive number', () => {
    expect(REFRESH_INTERVAL).toBeGreaterThan(0);
  });
});

describe('CACHE_TTL', () => {
  it('should be a positive number', () => {
    expect(CACHE_TTL).toBeGreaterThan(0);
  });
});