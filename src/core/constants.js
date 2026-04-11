export const STABLECOINS = [
  'usdt', 'usdc', 'dai', 'busd', 'ust', 'tusd', 'usdp', 'usdd',
  'frax', 'lusd', 'usds', 'usde', 'usd1', 'pyusd', 'usdg', 'usdf', 'buidl'
];

export const XSTOCK_IDS = [
  'apple-xstock',
  'microsoft-xstock',
  'alphabet-xstock',
  'amazon-xstock',
  'meta-xstock',
  'nvidia-xstock',
  'tesla-xstock'
];

export const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h';

export const XSTOCKS_API_URL = (ids) => 
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`;

export const REFRESH_INTERVAL = 60;
