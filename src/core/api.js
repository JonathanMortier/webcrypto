import { API_URL, STABLECOINS } from './constants.js';

export async function fetchCryptoData() {
  const response = await fetch(API_URL);
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
