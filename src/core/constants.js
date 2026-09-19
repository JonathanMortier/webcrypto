export const STABLECOINS = [
  'usdt',
  'usdc',
  'dai',
  'busd',
  'ust',
  'tusd',
  'usdp',
  'usdd',
  'frax',
  'lusd',
  'usds',
  'usde',
  'usd1',
  'pyusd',
  'usdg',
  'usdf',
  'buidl',
  'figr_heloc',
  'usyc',
  'usdy',
  'rlusd',
];

export const COINGECKO_BASE = '/api/coingecko';

export const XSTOCK_IDS = [
  'apple-xstock',
  'microsoft-xstock',
  'alphabet-xstock',
  'amazon-xstock',
  'meta-xstock',
  'nvidia-xstock',
  'tesla-xstock',
];

export const API_URL = `${COINGECKO_BASE}/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`;

export const XSTOCKS_API_URL = (ids) =>
  `${COINGECKO_BASE}/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`;

export const REFRESH_INTERVAL = 60;

export const CACHE_TTL = 120;

export const CATEGORY_CACHE_TTL = 600;

export const STABLECOINS_CATEGORY = 'stablecoins';

export const MIN_STABLECOIN_MARKET_CAP = 400_000_000;

// Curated macro-categories used for the header dropdown filter.
// CoinGecko category ids are resolved at runtime; unknown ids are skipped.
export const CATEGORY_IDS = [
  { id: 'layer-1', name: 'Layer 1' },
  { id: 'smart-contract-platform', name: 'Smart Contract Platform' },
  { id: 'meme-token', name: 'Meme' },
  { id: 'privacy', name: 'Privacy' },
  { id: 'decentralized-finance-defi', name: 'DeFi' },
  { id: 'artificial-intelligence', name: 'AI' },
  { id: 'real-world-assets-rwa', name: 'RWA' },
  { id: 'centralized-exchange-token-cex', name: 'Exchange Token' },
  { id: 'decentralized-exchange', name: 'DEX' },
  { id: 'oracle', name: 'Oracle' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'metaverse', name: 'Metaverse' },
  { id: 'depin', name: 'DePIN' },
  { id: 'payments', name: 'Payments' },
];

export const CATEGORIES_URL = `${COINGECKO_BASE}/api/v3/coins/categories?order=market_cap_desc`;

export const CATEGORY_MARKETS_URL = (categoryId) =>
  `${COINGECKO_BASE}/api/v3/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`;

export const ALERT_THRESHOLD = 5;

export const RANK_HISTORY_MAX_AGE_DAYS = 30;

export const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
export const WEATHER_BASE_URL = 'https://api.weatherapi.com/v1';

export const INDICES = [
  { id: 'sp500', name: 'S&P 500', symbol: '^GSPC', currency: '$' },
  { id: 'nasdaq', name: 'Nasdaq', symbol: '^IXIC', currency: '$' },
  { id: 'dow', name: 'Dow Jones', symbol: '^DJI', currency: '$' },
  { id: 'cac40', name: 'CAC 40', symbol: '^FCHI', currency: '€' },
  { id: 'dax', name: 'DAX', symbol: '^GDAXI', currency: '€' },
  { id: 'stoxx50', name: 'Euro Stoxx 50', symbol: '^STOXX50E', currency: '€' },
  { id: 'ftse100', name: 'FTSE 100', symbol: '^FTSE', currency: '£' },
  { id: 'nikkei', name: 'Nikkei 225', symbol: '^N225', currency: '¥' },
];

export const INDICES_ETF = [
  { id: 'sp500-etf', name: 'ETF S&P 500', symbol: 'PSPH.PA', isin: 'FR0011871136', currency: '€' },
  { id: 'nasdaq-etf', name: 'ETF Nasdaq 100', symbol: 'SXRV.DE', isin: 'IE00B53SZB19', currency: '€' },
  { id: 'eurostoxx-etf', name: 'ETF Euro Stoxx 600', symbol: 'ETSZ.DE', isin: 'FR0011550193', currency: '€' },
  { id: 'msci-world-etf', name: 'ETF MSCI World', symbol: 'EUNL.DE', isin: 'IE00B4L5Y983', currency: '€' },
];
