import { API_URL, XSTOCKS_API_URL, XSTOCK_IDS, STABLECOINS, CACHE_TTL, INDICES } from './constants.js';

const CACHE_PREFIX = 'cryptowatch_cache_';

function getFromLocalStorage(key) {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    return { data, timestamp };
  } catch {
    return null;
  }
}

function setToLocalStorage(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn('LocalStorage full or unavailable:', e);
  }
}

function withCache(key, ttlMs, fetchFn) {
  return async (...args) => {
    const cached = getFromLocalStorage(key);
    if (cached && (Date.now() - cached.timestamp) < ttlMs) {
      return cached.data;
    }

    try {
      const data = await fetchFn(...args);
      setToLocalStorage(key, data);
      return data;
    } catch (err) {
      if (err.status === 429 || err.message?.includes('429')) {
        if (cached) {
          console.warn('Rate limited, using cached data');
          return cached.data;
        }
      }
      throw err;
    }
  };
}

export const fetchCryptoData = withCache(
  'crypto_markets',
  CACHE_TTL * 1000,
  async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }
    return response.json();
  }
);

export const fetchXStocks = withCache(
  'xstocks',
  CACHE_TTL * 1000,
  async () => {
    const ids = XSTOCK_IDS.join(',');
    const response = await fetch(XSTOCKS_API_URL(ids));
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }
    return response.json();
  }
);



export function filterStablecoins(cryptos) {
  return cryptos.filter(coin => !STABLECOINS.includes(coin.symbol.toLowerCase()));
}

export function getTopGainers(cryptos, limit = 10) {
  return cryptos
    .filter(coin => (coin.price_change_percentage_24h ?? 0) > 0)
    .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))
    .slice(0, limit);
}

export async function fetchFearAndGreed() {
  const response = await fetch('https://api.alternative.me/fng/?limit=1');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du Fear & Greed');
  }
  return response.json();
}

export function calculateMarketStats(cryptos) {
  if (!cryptos || cryptos.length === 0) {
    return {
      totalMarketCap: 0,
      totalVolume: 0,
      btcDominance: 0,
      ethDominance: 0,
      marketCapChange: 0,
      altcoinSeason: 0,
    };
  }

  const totalMarketCap = cryptos.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const totalVolume = cryptos.reduce((sum, c) => sum + (c.total_volume || 0), 0);

  const btc = cryptos.find(c => c.symbol === 'btc');
  const eth = cryptos.find(c => c.symbol === 'eth');

  const btcDominance = btc && totalMarketCap > 0 
    ? ((btc.market_cap / totalMarketCap) * 100).toFixed(1) 
    : '0';
  
  const ethDominance = eth && totalMarketCap > 0 
    ? ((eth.market_cap / totalMarketCap) * 100).toFixed(1) 
    : '0';

  const marketCapChange = totalMarketCap > 0 
    ? cryptos.reduce((sum, c) => {
        const change = c.price_change_percentage_24h || 0;
        const weight = (c.market_cap || 0) / totalMarketCap;
        return sum + (change * weight);
      }, 0).toFixed(2)
    : '0';

  const btcChange = btc?.price_change_percentage_24h || 0;
  const altcoinsOutperforming = cryptos.filter(c => 
    c.symbol !== 'btc' && 
    (c.price_change_percentage_24h || 0) > btcChange
  ).length;
  
  const altcoinSeason = Math.round((altcoinsOutperforming / Math.max(cryptos.length - 1, 1)) * 100);

  return {
    totalMarketCap,
    totalVolume,
    btcDominance,
    ethDominance,
    marketCapChange,
    altcoinSeason,
  };
}

const ISIN_MAP_CACHE = 'isin_symbol_map';

async function resolveIndicesSymbols() {
  const cached = getFromLocalStorage(ISIN_MAP_CACHE);
  if (cached && (Date.now() - cached.timestamp) < 86400000) {
    return cached.data;
  }

  const searchResults = await Promise.allSettled(
    INDICES.map(async (idx) => {
      const res = await fetch(`/api/yahoo/v1/finance/search?q=${idx.isin}&quotesCount=1&newsCount=0`);
      const json = await res.json();
      const symbol = json?.quotes?.[0]?.symbol || null;
      return { isin: idx.isin, symbol };
    })
  );

  const entries = searchResults.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { isin: INDICES[i].isin, symbol: null }
  );

  const currencyResults = await Promise.allSettled(
    entries.map(async (entry) => {
      if (!entry.symbol) return { ...entry, currency: null };
      const res = await fetch(`/api/yahoo/v8/finance/chart/${entry.symbol}?range=1d&interval=1d`);
      const json = await res.json();
      const currency = json?.chart?.result?.[0]?.meta?.currency || null;
      return { ...entry, currency };
    })
  );

  const mapping = {};
  for (let i = 0; i < entries.length; i++) {
    const entry = currencyResults[i]?.status === 'fulfilled'
      ? currencyResults[i].value
      : { ...entries[i], currency: null };
    mapping[entry.isin] = { symbol: entry.symbol, currency: entry.currency };
  }

  setToLocalStorage(ISIN_MAP_CACHE, mapping);
  return mapping;
}

const fetchIndicesRaw = async () => {
  const symbolMapping = await resolveIndicesSymbols();

  const symbols = INDICES.map(idx => symbolMapping[idx.isin]?.symbol).filter(Boolean);
  if (symbols.length === 0) throw new Error('No symbols resolved from ISINs');

  const needsFx = Object.values(symbolMapping).some(m => m?.currency && m.currency !== 'EUR');

  const url = `/api/yahoo/v8/finance/spark?symbols=${symbols.join(',')}&range=1d&interval=1d`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);
  const json = await res.json();

  let eurUsdRate = null;
  if (needsFx) {
    try {
      const fxRes = await fetch('/api/yahoo/v8/finance/spark?symbols=EURUSD=X&range=1d&interval=1d');
      const fxJson = await fxRes.json();
      const fxData = fxJson['EURUSD=X'];
      if (fxData?.close?.length > 0) {
        eurUsdRate = fxData.close[fxData.close.length - 1];
      }
    } catch (e) {
      console.warn('Failed to fetch EUR/USD rate:', e);
    }
  }

  const results = [];
  for (const index of INDICES) {
    const mapping = symbolMapping[index.isin];
    const symbol = mapping?.symbol;
    const data = json[symbol];

    if (data?.close?.length > 0 && data.chartPreviousClose != null) {
      let price = data.close[data.close.length - 1];
      let prevClose = data.chartPreviousClose;

      if (mapping?.currency && mapping.currency !== 'EUR' && eurUsdRate) {
        price = price / eurUsdRate;
        prevClose = prevClose / eurUsdRate;
      }

      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      results.push({ ...index, price, change, changePercent });
    } else {
      console.warn(`Yahoo no data for ${symbol} (ISIN ${index.isin})`);
      results.push({ ...index, price: null, change: null, changePercent: null });
    }
  }

  if (!results.some(r => r.price != null)) {
    throw new Error('All index calls failed');
  }
  return results;
};

export const fetchIndicesData = withCache('indices_v2', 600_000, fetchIndicesRaw);

export const fetchEtfData = withCache(
  'etf_markets',
  CACHE_TTL * 1000,
  async () => {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=crypto-etf&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des ETFs');
    }
    return response.json();
  }
);

export async function fetchCoinHistory(coinId, days = 7) {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de l\'historique');
  }
  return response.json();
}
