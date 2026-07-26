# CryptoWatch - Agent Instructions

## Key Commands

| Command                          | Description                                                        |
| -------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                    | Dev server (hot reload) on http://localhost:5173                   |
| `npm run build`                  | Production build                                                   |
| `npm start`                      | Production server (Express + Yahoo proxy) on http://localhost:3000 |
| `npm run test`                   | Run all tests (no watch mode)                                      |
| `npm run test:watch`             | Run tests in watch mode                                            |
| `npx vitest run src/test/<file>` | Run a single test file                                             |
| `npm run lint`                   | Lint JS/JSX with ESLint                                            |
| `npm run lint:fix`               | Lint + auto-fix                                                    |
| `npm run format`                 | Format all files with Prettier                                     |
| `npm run format:check`           | Check formatting without modifying                                 |

## Tech Stack

- React 19 + Vite 8 (No TypeScript)
- Chart.js + react-chartjs-2
- Vitest + jsdom + @testing-library/react for testing
- CoinGecko API (free tier - rate limited), Yahoo Finance (via proxy)
- react-router-dom v7 (HashRouter)
- vite-plugin-pwa (auto-update service worker, Workbox precaching)

## Project Structure

```
src/
├── App.jsx                 # Root: state, routing, price alerts, keyboard shortcuts
├── main.jsx                # Entry point (React 19 createRoot)
├── components/
│   ├── index.js            # Re-exports all components
│   ├── CryptoCard.jsx      # Single crypto card (stats, chart, favorite toggle)
│   ├── CryptoGrid.jsx      # Sortable/filterable grid of crypto cards
│   ├── CryptoTicker.jsx    # Top marquee of top 10 gainers
│   ├── StocksTicker.jsx    # Bottom marquee of 7 x-stocks
│   ├── FearGreedIndex.jsx  # Floating Fear & Greed widget
│   ├── GoldPrice.jsx       # Gold price card (Bourse page)
│   ├── Header.jsx          # Header (search, theme toggle, notif toggle, refresh)
│   ├── InstallPrompt.jsx   # PWA install banner (beforeinstallprompt)
│   ├── MarketIndicators.jsx # Market stats bar (cap, volume, dominance)
│   ├── NavMenu.jsx         # Hamburger navigation menu
│   ├── PriceChart.jsx      # Chart.js line chart (1h/24h/7d/30d/1y)
│   ├── Status.jsx          # Loading spinner & Error+Retry components
│   └── WeatherWidget.jsx   # Weather display in market indicators
├── core/
│   ├── index.js            # Re-exports from api.js, constants.js, utils.js
│   ├── api.js              # All API fetches with localStorage cache decorator
│   ├── constants.js        # Config: URLs, TTLs, stablecoins, indices, ALERT_THRESHOLD
│   ├── cryptoImages.json   # 37 coin IDs + CoinGecko image URLs
│   ├── imageCache.js       # Local image mapping + pre-caching
│   ├── utils.js            # formatPrice, formatLargeNumber, getChangeClass, etc.
│   └── weatherApi.js       # Geolocation + WeatherAPI.com fetch
├── pages/
│   ├── index.js            # Re-exports BoursePage, EtfPage
│   ├── BoursePage.jsx      # Indices + portfolio tracking + stocks + gold
│   └── EtfPage.jsx         # Crypto ETFs (not currently routed)
├── styles/
│   ├── index.css           # Master CSS (imports all others)
│   ├── global.css          # CSS variables, theme, reset, PWA button
│   ├── header.css          # Header, NavMenu, notification toast
│   ├── cryptoCard.css      # Crypto card + chart + favorite
│   ├── cryptoGrid.css      # Grid layout
│   ├── ticker.css          # Top crypto ticker marquee
│   ├── stocksTicker.css    # Bottom stocks ticker
│   ├── marketIndicators.css # Market stats bar
│   ├── fearGreed.css       # Fear & Greed widget
│   ├── goldPrice.css       # Gold card
│   ├── indices.css         # Index cards + portfolio holdings
│   ├── status.css          # Loading/error states
│   └── weatherWidget.css   # Weather display
└── test/
    ├── setup.js            # Vitest setup, jest-dom, matchMedia mock
    ├── api.test.js
    ├── App.test.jsx
    ├── BoursePage.test.jsx
    ├── constants.test.js
    ├── CryptoCard.test.jsx
    ├── CryptoGrid.test.jsx
    ├── FearGreedIndex.test.jsx
    ├── utils.test.js
    └── WeatherWidget.test.jsx
```

## All Components

| Component          | Source                 | Description                                                          |
| ------------------ | ---------------------- | -------------------------------------------------------------------- |
| `Header`           | `Header.jsx`           | Search, theme toggle, notif toggle, refresh button, last-update time |
| `CryptoGrid`       | `CryptoGrid.jsx`       | Responsive grid of CryptoCard, handles sort/filter                   |
| `CryptoCard`       | `CryptoCard.jsx`       | Single coin: price, 24h change, chart toggle, favorite star          |
| `CryptoTicker`     | `CryptoTicker.jsx`     | Fixed top marquee of top 10 gainers                                  |
| `StocksTicker`     | `StocksTicker.jsx`     | Fixed bottom marquee of 7 stocks                                     |
| `FearGreedIndex`   | `FearGreedIndex.jsx`   | Floating toggle, shows F&G value bar                                 |
| `MarketIndicators` | `MarketIndicators.jsx` | Total market cap, volume, BTC/ETH dominance, altcoin season          |
| `InstallPrompt`    | `InstallPrompt.jsx`    | PWA install button (beforeinstallprompt event)                       |
| `NavMenu`          | `NavMenu.jsx`          | Hamburger nav: `/` (CryptoWatch) and `/bourse` (Bourse)              |
| `PriceChart`       | `PriceChart.jsx`       | Chart.js line chart with timeframe buttons                           |
| `WeatherWidget`    | `WeatherWidget.jsx`    | City + temp + icon in market indicators                              |
| `Loading`          | `Status.jsx`           | "Chargement des données..." spinner                                  |
| `Error`            | `Status.jsx`           | Error message + "Réessayer" button                                   |
| `BoursePage`       | `pages/BoursePage.jsx` | Indices, portfolio holdings, x-stocks, gold                          |

## All localStorage Keys

| Key                     | Type                     | Description                                 |
| ----------------------- | ------------------------ | ------------------------------------------- |
| `theme`                 | `'dark'` / `'light'`     | UI theme preference                         |
| `favorites`             | `JSON.stringify(Array)`  | Array of favorited coin IDs                 |
| `notificationsEnabled`  | `'true'` / `'false'`     | Notification toggle state                   |
| `previousPrices`        | `JSON.stringify(Object)` | Daily price snapshot `{ coinId: price }`    |
| `priceSnapshotDate`     | `Date.toDateString()`    | Date of last snapshot (resets daily)        |
| `lastAlertPrices`       | `JSON.stringify(Object)` | Prices at last alert `{ coinId: price }`    |
| `cryptowatch_cache_*`   | cached API data          | Various API response caches with timestamps |
| `indices_holdings`      | `JSON.stringify(Object)` | Portfolio units/average prices per index    |
| `cryptowatch_weather_*` | cached weather data      | Location + weather data with timestamps     |

## All State in App.jsx

| State                  | Init               | Persisted | Description                            |
| ---------------------- | ------------------ | --------- | -------------------------------------- |
| `cryptos`              | `[]`               | No        | Filtered crypto list with display_rank |
| `topGainers`           | `[]`               | No        | Top 10 gainers for ticker              |
| `stocks`               | `[]`               | No        | x-stocks sorted by 24h change          |
| `fearGreed`            | `null`             | No        | F&G index data point                   |
| `isLoading`            | `false`            | No        | Loading flag                           |
| `error`                | `null`             | No        | Error message                          |
| `lastUpdate`           | `null`             | No        | Last refresh timestamp                 |
| `countdown`            | `REFRESH_INTERVAL` | No        | Seconds until next auto-refresh        |
| `searchQuery`          | `''`               | No        | Search/filter text                     |
| `sortField`            | `'market_cap'`     | No        | Sort column                            |
| `sortDir`              | `'desc'`           | No        | Sort direction                         |
| `theme`                | localStorage       | Yes       | Dark/light theme                       |
| `favorites`            | localStorage       | Yes       | Coin IDs                               |
| `showFavoritesOnly`    | `false`            | No        | Filter toggle                          |
| `notificationsEnabled` | localStorage       | Yes       | Notif toggle                           |
| `previousPrices`       | localStorage       | Yes       | Daily price snapshot                   |
| `priceSnapshotDate`    | localStorage       | Yes       | Snapshot date string                   |
| `lastAlertPrices`      | localStorage       | Yes       | Prices at last alert                   |
| `notificationMessage`  | `null`             | No        | Toast message for notif feedback       |

Refs: `countdownRef`, `intervalRef`, `notificationsRef`, `favoritesRef`, `previousPricesRef`, `priceSnapshotDateRef`, `lastAlertPricesRef`

## Notification System (Price Alerts)

**Trigger:** Called from `loadData()` every 60s (`App.jsx:121`)

**Flow:**

1. `checkPriceAlerts(filtered)` filters to favorites only
2. Compares current price vs `previousPrices` (daily snapshot)
3. Skips re-alerts via `lastAlertPrices` (same crypto must move another 5% from last alert price)
4. Batches all alerts into a single `new Notification()`
5. On new day: resets snapshot and clears `lastAlertPrices`

**Key points:**

- Only fires for **favorite** cryptos
- Threshold: `ALERT_THRESHOLD` from `constants.js` (default 5%)
- Single grouped notification (+ multiple lines) instead of per-coin
- Snapshot updated once per day (not every cycle)
- Toast feedback when permission denied

## Keyboard Shortcuts (App.jsx)

| Key | Action             |
| --- | ------------------ |
| `R` | Refresh data       |
| `F` | Focus search input |
| `T` | Toggle theme       |

All skipped when `e.target.tagName === 'INPUT'`.

## API Functions (src/core/api.js)

| Function                     | Cache TTL | Fetches                                         |
| ---------------------------- | --------- | ----------------------------------------------- |
| `fetchCryptoData()`          | 120s      | Top 50 crypto markets                           |
| `fetchXStocks()`             | 120s      | 7 x-stocks (AAPL, MSFT, etc.)                   |
| `fetchFearAndGreed()`        | none      | Fear & Greed Index                              |
| `fetchIndicesData()`         | 10min     | S&P 500, Nasdaq 100, Euro Stoxx 600, MSCI World |
| `fetchGoldPrice()`           | 5min      | Gold price (GC=F)                               |
| `fetchEtfData()`             | 120s      | Crypto ETFs                                     |
| `fetchCoinHistory(id, days)` | none      | Historical price chart data                     |
| `filterStablecoins(data)`    | pure      | Removes stablecoins by symbol                   |
| `getTopGainers(data, n=10)`  | pure      | Top N by positive 24h change                    |
| `calculateMarketStats(data)` | pure      | Total cap, volume, dominance                    |

Uses `withCache(key, ttlMs, fetchFn)` decorator for localStorage caching.

## Image System

- **Local PNGs**: `public/images/cryptos/<id>.png` and `public/images/xstocks/<company>.png`
- **Image cache**: `imageCache.js` maps coin IDs to local paths via `getImageUrl(coinId, defaultUrl)`
- **Refresh**: `scripts/refreshImages.py` updates weekly from CoinGecko

## Weather Feature

- **`detectLocation()`**: GPS → IP fallback (ip-api.com), cached 24h
- **`fetchWeather(lat, lon)`**: WeatherAPI.com (requires `VITE_WEATHER_API_KEY`), cached 10min
- Rendered by `WeatherWidget.jsx` inside `MarketIndicators`

## PWA

- `vite-plugin-pwa` with `registerType: 'autoUpdate'` and Workbox precaching
- `InstallPrompt.jsx` listens for `beforeinstallprompt` event
- No push notification support (service worker is cache-only)

## Routing

- `HashRouter` with 2 routes: `/` (dashboard) and `/bourse` (indices/stocks)
- `NavMenu` hamburger for navigation

## Proxy Architecture

- Dev: Vite proxy (`/api/yahoo/*` → Yahoo, `/api/coingecko/*` → CoinGecko)
- Vercel: `api/yahoo.js` / `api/coingecko.js` serverless functions
- Local prod: Express `server.js` with rate limiter + proxy middleware

## Deployment

- Vercel auto-deploy from GH commits
- `vercel.json` rewrites all routes to `index.html` (SPA)
- `npm run build && npm start` for local production

## Important Constraints

- **API rate limiting**: CoinGecko free tier is strict. Cache TTL = 120s. Do not remove.
- **Lint & format**: Run `npm run lint` and `npm run format:check` before commits.
- **Pre-commit hooks**: husky + lint-staged auto-fix on commit.
- **Images are local**: weekly refresh via `scripts/refreshImages.py`.
- **Notifications only work when page/tab is open** (no push server).

## Testing

- Vitest + jsdom + @testing-library/react
- `Notification` is globally stubbed in test setup
- `fetchCryptoData`, `fetchXStocks`, `fetchFearAndGreed` are mocked in App tests
- `getImageUrl` is mocked to return the raw URL

## OpenSpec

Feature specs live in `openspec/specs/`. Each spec defines requirements with GIVEN/WHEN/THEN scenarios. Check before implementing new functionality.
