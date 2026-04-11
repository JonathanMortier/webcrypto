export const STABLECOINS = [
  'usdt', 'usdc', 'dai', 'busd', 'ust', 'tusd', 'usdp', 'usdd',
  'frax', 'lusd', 'usds', 'usde', 'usd1', 'pyusd', 'usdg', 'usdf', 'buidl'
];

export const STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'Nvidia' },
  { symbol: 'TSLA', name: 'Tesla' }
];

export const MOCK_STOCK_DATA = [
  { symbol: 'AAPL', regularMarketChangePercent: 1.25 },
  { symbol: 'MSFT', regularMarketChangePercent: 0.87 },
  { symbol: 'GOOGL', regularMarketChangePercent: -0.45 },
  { symbol: 'AMZN', regularMarketChangePercent: 2.13 },
  { symbol: 'META', regularMarketChangePercent: 1.56 },
  { symbol: 'NVDA', regularMarketChangePercent: 3.42 },
  { symbol: 'TSLA', regularMarketChangePercent: -1.28 }
];

export const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h';
