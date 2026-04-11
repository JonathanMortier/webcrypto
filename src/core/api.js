import { API_URL, XSTOCKS_API_URL, XSTOCK_IDS, STABLECOINS } from './constants.js';

export async function fetchCryptoData() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des données');
  }
  return response.json();
}

export async function fetchXStocks() {
  const ids = XSTOCK_IDS.join(',');
  const response = await fetch(XSTOCKS_API_URL(ids));
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des données');
  }
  return response.json();
}

export function filterStablecoins(cryptos) {
  return cryptos.filter(coin => !STABLECOINS.includes(coin.symbol.toLowerCase()));
}

export function getTopGainers(cryptos, limit = 10) {
  return cryptos
    .filter(coin => (coin.price_change_percentage_24h ?? 0) > 0)
    .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))
    .slice(0, limit);
}

export async function fetchCryptoChart(coinId) {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du graphique');
  }
  return response.json();
}
