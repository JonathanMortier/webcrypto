import { API_URL, XSTOCKS_API_URL, XSTOCK_IDS, STABLECOINS, CACHE_TTL } from './constants.js';

const apiCache = new Map();

function withCache(key, ttlMs, fetchFn) {
  return async (...args) => {
    const cached = apiCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < ttlMs) {
      return cached.data;
    }
    const data = await fetchFn(...args);
    apiCache.set(key, { data, timestamp: Date.now() });
    return data;
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
