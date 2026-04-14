import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  filterStablecoins,
  getTopGainers,
  calculateMarketStats,
  fetchFearAndGreed,
} from '../core/api.js';

global.fetch = vi.fn();

describe('filterStablecoins', () => {
  const cryptos = [
    { symbol: 'btc', name: 'Bitcoin' },
    { symbol: 'eth', name: 'Ethereum' },
    { symbol: 'usdt', name: 'Tether' },
    { symbol: 'dai', name: 'Dai' },
    { symbol: 'sol', name: 'Solana' },
  ];

  it('should filter out stablecoins', () => {
    const result = filterStablecoins(cryptos);
    expect(result.length).toBe(3);
    expect(result.map(c => c.symbol)).toEqual(['btc', 'eth', 'sol']);
  });

  it('should return all cryptos when no stablecoins', () => {
    const result = filterStablecoins([
      { symbol: 'btc', name: 'Bitcoin' },
      { symbol: 'eth', name: 'Ethereum' },
    ]);
    expect(result.length).toBe(2);
  });
});

describe('getTopGainers', () => {
  const cryptos = [
    { symbol: 'btc', price_change_percentage_24h: 5 },
    { symbol: 'eth', price_change_percentage_24h: 10 },
    { symbol: 'sol', price_change_percentage_24h: -2 },
    { symbol: 'ada', price_change_percentage_24h: 3 },
  ];

  it('should return cryptocurrencies with positive change sorted descending', () => {
    const result = getTopGainers(cryptos);
    expect(result.length).toBe(3);
    expect(result[0].symbol).toBe('eth');
    expect(result[1].symbol).toBe('btc');
    expect(result[2].symbol).toBe('ada');
  });

  it('should respect limit parameter', () => {
    const result = getTopGainers(cryptos, 2);
    expect(result.length).toBe(2);
  });

  it('should handle cryptos without price_change_percentage_24h', () => {
    const cryptosWithNull = [
      { symbol: 'btc', price_change_percentage_24h: null },
      { symbol: 'eth', price_change_percentage_24h: 5 },
    ];
    const result = getTopGainers(cryptosWithNull);
    expect(result.length).toBe(1);
    expect(result[0].symbol).toBe('eth');
  });
});

describe('calculateMarketStats', () => {
  it('should return default stats for empty array', () => {
    const result = calculateMarketStats([]);
    expect(result.totalMarketCap).toBe(0);
    expect(result.totalVolume).toBe(0);
  });

  it('should return default stats for null/undefined', () => {
    const result = calculateMarketStats(null);
    expect(result.totalMarketCap).toBe(0);
  });

  it('should calculate market cap and volume', () => {
    const cryptos = [
      { symbol: 'btc', market_cap: 1000000000000, total_volume: 50000000000, price_change_percentage_24h: 2 },
      { symbol: 'eth', market_cap: 400000000000, total_volume: 20000000000, price_change_percentage_24h: 3 },
    ];
    const result = calculateMarketStats(cryptos);
    expect(result.totalMarketCap).toBe(1400000000000);
    expect(result.totalVolume).toBe(70000000000);
  });

  it('should calculate BTC and ETH dominance in percentage', () => {
    const cryptos = [
      { symbol: 'btc', market_cap: 500, total_volume: 100, price_change_percentage_24h: 1 },
      { symbol: 'eth', market_cap: 500, total_volume: 50, price_change_percentage_24h: 2 },
    ];
    const result = calculateMarketStats(cryptos);
    expect(result.btcDominance).toBe('50.0');
    expect(result.ethDominance).toBe('50.0');
  });

  it('should calculate market cap weighted change', () => {
    const cryptos = [
      { symbol: 'btc', market_cap: 1000, total_volume: 100, price_change_percentage_24h: 2 },
      { symbol: 'eth', market_cap: 1000, total_volume: 100, price_change_percentage_24h: 4 },
    ];
    const result = calculateMarketStats(cryptos);
    expect(result.marketCapChange).toBe('3.00');
  });

  it('should calculate altcoin season index', () => {
    const cryptos = [
      { symbol: 'btc', market_cap: 1000, total_volume: 100, price_change_percentage_24h: 5 },
      { symbol: 'eth', market_cap: 100, total_volume: 10, price_change_percentage_24h: 3 },
      { symbol: 'sol', market_cap: 100, total_volume: 10, price_change_percentage_24h: 2 },
      { symbol: 'ada', market_cap: 100, total_volume: 10, price_change_percentage_24h: 1 },
    ];
    const result = calculateMarketStats(cryptos);
    expect(result.altcoinSeason).toBe(0);
  });
});

describe('fetchFearAndGreed', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should fetch fear and greed data', async () => {
    const mockData = { data: [{ value: '45', value_classification: 'Fear' }] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchFearAndGreed();
    expect(result).toEqual(mockData);
  });

  it('should throw error on failed fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchFearAndGreed()).rejects.toThrow('Erreur lors de la récupération du Fear & Greed');
  });
});