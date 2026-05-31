export const STABLECOINS = [
  'usdt', 'usdc', 'dai', 'busd', 'ust', 'tusd', 'usdp', 'usdd',
  'frax', 'lusd', 'usds', 'usde', 'usd1', 'pyusd', 'usdg', 'usdf', 'buidl',
  'figr_heloc', 'usyc', 'usdy'
];

export const COINGECKO_BASE = '/api/coingecko';

export const XSTOCK_IDS = [
  'apple-xstock',
  'microsoft-xstock',
  'alphabet-xstock',
  'amazon-xstock',
  'meta-xstock',
  'nvidia-xstock',
  'tesla-xstock'
];

export const API_URL = `${COINGECKO_BASE}/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`;

export const XSTOCKS_API_URL = (ids) => 
  `${COINGECKO_BASE}/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`;

export const REFRESH_INTERVAL = 60;

export const CACHE_TTL = 120;

export const KEY_AVANTAGE = 'R0HKPO7I2TZ618CO';

export const KEY_FINNHUB = 'd83j201r01qkm5c8b1qgd83j201r01qkm5c8b1r0';

export const WEATHER_API_KEY = '92366d2c8caf4e80a8b142025263105';
export const WEATHER_BASE_URL = 'https://api.weatherapi.com/v1';

export const INDICES = [
  { id: 'sp500', name: 'S&P 500', symbol: 'PSPH.PA', isin: 'FR0011871136' },
  { id: 'nasdaq', name: 'Nasdaq 100', symbol: 'SXRV.DE' , isin: 'IE00B53SZB19'},
  { id: 'eurostoxx', name: 'Euro Stoxx 600', symbol: 'ETSZ.DE', isin: 'FR0011550193' },
  { id: 'msci-world', name: 'MSCI World', symbol: 'EUNL.DE' , isin: 'IE00B4L5Y983'},
];
