import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  filterStablecoins,
  getTopGainers,
  calculateMarketStats,
  fetchFearAndGreed,
  fetchIndexHistory,
  enrichWithCategories,
  filterByCategory,
  fetchCryptoData,
  fetchXStocks,
  fetchCategories,
  fetchCryptoDataByCategory,
  fetchStablecoins,
  fetchIndicesData,
  fetchIndicesEtfData,
  fetchGoldPrice,
  fetchEtfData,
  fetchSpaceXPrice,
  fetchCoinHistory,
  fetchCoinDetail,
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
    expect(result.map((c) => c.symbol)).toEqual(['btc', 'eth', 'sol']);
  });

  it('should return all cryptos when no stablecoins', () => {
    const result = filterStablecoins([
      { symbol: 'btc', name: 'Bitcoin' },
      { symbol: 'eth', name: 'Ethereum' },
    ]);
    expect(result.length).toBe(2);
  });
});

describe('enrichWithCategories', () => {
  it('should attach categories from the map', () => {
    const result = enrichWithCategories([{ id: 'bitcoin' }], { bitcoin: ['Cryptocurrency'] });
    expect(result[0].categories).toEqual(['Cryptocurrency']);
  });

  it('should default to empty categories when coin not in map', () => {
    const result = enrichWithCategories([{ id: 'unknown' }], {});
    expect(result[0].categories).toEqual([]);
  });
});

describe('filterByCategory', () => {
  const cryptos = [
    { id: 'bitcoin', categories: ['Cryptocurrency', 'Smart Contract Platform'] },
    { id: 'ethereum', categories: ['Smart Contract Platform'] },
  ];

  it('should return only cryptos with the given category', () => {
    const result = filterByCategory(cryptos, 'Cryptocurrency');
    expect(result.map((c) => c.id)).toEqual(['bitcoin']);
  });

  it('should return all cryptos when no category provided', () => {
    const result = filterByCategory(cryptos, '');
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
      {
        symbol: 'btc',
        market_cap: 1000000000000,
        total_volume: 50000000000,
        price_change_percentage_24h: 2,
      },
      {
        symbol: 'eth',
        market_cap: 400000000000,
        total_volume: 20000000000,
        price_change_percentage_24h: 3,
      },
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

describe('fetchIndexHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  it('should return [timestamp, price] points from the chart endpoint', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        chart: {
          result: [
            {
              timestamp: [1700000000, 1700086400],
              indicators: { quote: [{ close: [7711.7, 7800.5] }] },
            },
          ],
        },
      }),
    });

    const result = await fetchIndexHistory('TESTINDEX');
    expect(result).toEqual([
      [1700000000000, 7711.7],
      [1700086400000, 7800.5],
    ]);
  });

  it('should filter out null closing prices', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        chart: {
          result: [
            {
              timestamp: [1700000000, 1700086400],
              indicators: { quote: [{ close: [7711.7, null] }] },
            },
          ],
        },
      }),
    });

    const result = await fetchIndexHistory('TESTINDEX2');
    expect(result).toEqual([[1700000000000, 7711.7]]);
  });

  it('should throw error on failed fetch', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchIndexHistory('TESTINDEX3')).rejects.toThrow('Impossible de récupérer les données');
  });
});

describe('withCache behavior (via fetchCryptoData)', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  it('should fetch and cache data on first call', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'bitcoin' }] });
    const result = await fetchCryptoData();
    expect(result).toEqual([{ id: 'bitcoin' }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/coingecko'));
    const cached = JSON.parse(localStorage.getItem('cryptowatch_cache_crypto_markets'));
    expect(cached.data).toEqual([{ id: 'bitcoin' }]);
  });

  it('should serve fresh cache without refetching', async () => {
    localStorage.setItem(
      'cryptowatch_cache_crypto_markets',
      JSON.stringify({ data: [{ id: 'cached' }], timestamp: Date.now() }),
    );
    const result = await fetchCryptoData();
    expect(result).toEqual([{ id: 'cached' }]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should refetch when the cached entry has expired', async () => {
    localStorage.setItem(
      'cryptowatch_cache_crypto_markets',
      JSON.stringify({ data: [{ id: 'old' }], timestamp: Date.now() - 200000 }),
    );
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'new' }] });
    const result = await fetchCryptoData();
    expect(result).toEqual([{ id: 'new' }]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should fall back to stale cached data when the fetch fails', async () => {
    localStorage.setItem(
      'cryptowatch_cache_crypto_markets',
      JSON.stringify({ data: [{ id: 'stale' }], timestamp: Date.now() - 200000 }),
    );
    fetch.mockResolvedValueOnce({ ok: false });
    const result = await fetchCryptoData();
    expect(result).toEqual([{ id: 'stale' }]);
  });

  it('should throw the rewritten error when no cache exists and fetch fails', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchCryptoData()).rejects.toThrow('Impossible de récupérer les données (crypto_markets)');
  });

  it('should throw the rewritten error when the network request rejects', async () => {
    fetch.mockRejectedValueOnce(new Error('network down'));
    await expect(fetchCryptoData()).rejects.toThrow('Impossible de récupérer les données (crypto_markets)');
  });

  it('should treat corrupted cached JSON as a cache miss', async () => {
    localStorage.setItem('cryptowatch_cache_crypto_markets', 'not-valid-json');
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'bitcoin' }] });
    await expect(fetchCryptoData()).resolves.toEqual([{ id: 'bitcoin' }]);
  });
});

describe('fetchXStocks', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  it('should fetch x-stocks and cache the result', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'apple-xstock' }] });
    const result = await fetchXStocks();
    expect(result).toEqual([{ id: 'apple-xstock' }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('apple-xstock'));
  });

  it('should reject with rewritten error when response is not ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchXStocks()).rejects.toThrow('Impossible de récupérer les données (xstocks)');
  });
});

describe('fetchCategories', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  it('should keep only known category ids from the API', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'layer-1', name: 'Layer 1' },
        { id: 'meme-token', name: 'Meme' },
        { id: 'does-not-exist', name: 'Other' },
      ],
    });
    const result = await fetchCategories();
    expect(result).toEqual([
      { id: 'layer-1', name: 'Layer 1' },
      { id: 'meme-token', name: 'Meme' },
    ]);
  });

  it('should skip entries without id or name', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [null, { id: 'oracle' }, { name: 'No Id' }, { id: 'gaming', name: 'Gaming' }],
    });
    const result = await fetchCategories();
    expect(result).toEqual([{ id: 'gaming', name: 'Gaming' }]);
  });

  it('should return empty array when response is not an array', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const result = await fetchCategories();
    expect(result).toEqual([]);
  });

  it('should reject with rewritten error when response is not ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchCategories()).rejects.toThrow('Impossible de récupérer les données (categories_v2)');
  });
});

describe('fetchCryptoDataByCategory', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  it('should fetch markets for the given category', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'xyz' }] });
    const result = await fetchCryptoDataByCategory('layer-1');
    expect(result).toEqual([{ id: 'xyz' }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('category=layer-1'));
  });

  it('should reject with rewritten error when response is not ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchCryptoDataByCategory('meme-token')).rejects.toThrow(
      'Impossible de récupérer les données (crypto_markets_cat_meme-token)',
    );
  });
});

describe('fetchStablecoins', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  it('should fetch stablecoin markets', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'tether' }] });
    const result = await fetchStablecoins();
    expect(result).toEqual([{ id: 'tether' }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('category=stablecoins'));
  });

  it('should reject with rewritten error when response is not ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchStablecoins()).rejects.toThrow(
      'Impossible de récupérer les données (crypto_markets_stablecoins)',
    );
  });
});

describe('fetchIndicesData', () => {
  let warnSpy;

  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should build index entries with price, change and changePercent', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        '^GSPC': { close: [5000, 5100, 5200], chartPreviousClose: 5100 },
        '^IXIC': { close: [17000], chartPreviousClose: 17500 },
      }),
    });
    const result = await fetchIndicesData();
    expect(result).toHaveLength(8);
    const sp = result.find((i) => i.id === 'sp500');
    expect(sp.price).toBe(5200);
    expect(sp.change).toBe(100);
    expect(sp.changePercent).toBeCloseTo(1.9608, 1);
    const nasdaq = result.find((i) => i.id === 'nasdaq');
    expect(nasdaq.change).toBe(-500);
  });

  it('should keep null placeholders when an index has no data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ '^GSPC': { close: [5200], chartPreviousClose: 5100 } }),
    });
    const result = await fetchIndicesData();
    const sp = result.find((i) => i.id === 'sp500');
    expect(sp.price).toBe(5200);
    const nasdaq = result.find((i) => i.id === 'nasdaq');
    expect(nasdaq.price).toBeNull();
    expect(nasdaq.changePercent).toBeNull();
  });

  it('should throw when no index returned a price', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await expect(fetchIndicesData()).rejects.toThrow('Impossible de récupérer les données (indices_v3)');
  });

  it('should reject on HTTP error', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchIndicesData()).rejects.toThrow('Impossible de récupérer les données (indices_v3)');
  });
});

describe('fetchIndicesEtfData', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  it('should fetch and enrich ETF index data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        'PSPH.PA': { close: [100, 110], chartPreviousClose: 100 },
      }),
    });
    const result = await fetchIndicesEtfData();
    const etf = result.find((i) => i.id === 'sp500-etf');
    expect(etf.price).toBe(110);
    expect(etf.change).toBe(10);
    expect(etf.changePercent).toBeCloseTo(10, 1);
    expect(result).toHaveLength(4);
  });
});

describe('fetchGoldPrice', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  it('should compute gold change from the previous close', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ regularMarketPrice: 4360.5, closes: [4300, 4360.5] }),
    });
    const result = await fetchGoldPrice();
    expect(result.price).toBe(4360.5);
    expect(result.change).toBeCloseTo(60.5, 1);
  });

  it('should use the price as previous close when there is a single close', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ regularMarketPrice: 100, closes: [100] }),
    });
    const result = await fetchGoldPrice();
    expect(result.change).toBe(0);
    expect(result.changePercent).toBe(0);
  });

  it('should reject with rewritten error when regularMarketPrice is missing', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ closes: [1, 2] }) });
    await expect(fetchGoldPrice()).rejects.toThrow('Impossible de récupérer les données (gold_price)');
  });

  it('should reject with rewritten error on HTTP error', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchGoldPrice()).rejects.toThrow('Impossible de récupérer les données (gold_price)');
  });
});

describe('fetchEtfData', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  it('should fetch ETF markets from CoinGecko', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'btc-etf' }] });
    const result = await fetchEtfData();
    expect(result).toEqual([{ id: 'btc-etf' }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('crypto-etf'));
  });

  it('should reject with rewritten error when response is not ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchEtfData()).rejects.toThrow('Impossible de récupérer les données (etf_markets)');
  });
});

describe('fetchSpaceXPrice', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  it('should compute SpaceX price, change and percent', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ SPCX: { close: [180, 190], chartPreviousClose: 180 } }),
    });
    const result = await fetchSpaceXPrice();
    expect(result.price).toBe(190);
    expect(result.change).toBe(10);
    expect(result.changePercent).toBeCloseTo(5.5555, 1);
  });

  it('should reject with rewritten error when close data is missing', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ SPCX: {} }) });
    await expect(fetchSpaceXPrice()).rejects.toThrow('Impossible de récupérer les données (spacex_price)');
  });

  it('should reject with rewritten error on HTTP error', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchSpaceXPrice()).rejects.toThrow('Impossible de récupérer les données (spacex_price)');
  });
});

describe('fetchCoinHistory', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  it('should fetch coin history with the default 7 days', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ prices: [[1, 2]] }) });
    const result = await fetchCoinHistory('bitcoin');
    expect(result).toEqual({ prices: [[1, 2]] });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('days=7'));
  });

  it('should pass the days parameter through', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ prices: [] }) });
    await fetchCoinHistory('bitcoin', 30);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('days=30'));
  });

  it('should reject when response is not ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchCoinHistory('bitcoin')).rejects.toThrow("Erreur lors de la récupération de l'historique");
  });
});

describe('fetchCoinDetail', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  it('should fetch coin detail data', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'bitcoin', name: 'Bitcoin' }) });
    const result = await fetchCoinDetail('bitcoin');
    expect(result.name).toBe('Bitcoin');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/coins/bitcoin'));
  });

  it('should reject with the coin id in the message when response is not ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchCoinDetail('bitcoin')).rejects.toThrow('Impossible de récupérer les détails (bitcoin)');
  });
});

describe('localStorage write failure handling', () => {
  let warnSpy;
  let setItemSpy;

  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setItemSpy = vi.spyOn(globalThis.Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
  });

  afterEach(() => {
    setItemSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('should warn and still return the fetched data when localStorage writes fail', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'bitcoin' }] });
    const result = await fetchCryptoData();
    expect(result).toEqual([{ id: 'bitcoin' }]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('LocalStorage full or unavailable'),
      expect.any(Error),
    );
  });
});
