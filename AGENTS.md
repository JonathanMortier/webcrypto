# CryptoWatch - Agent Instructions

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (hot reload) on http://localhost:5173 |
| `npm run build` | Production build |
| `npm start` | Production server (Express + Yahoo proxy) on http://localhost:3000 |
| `npm run test` | Run all tests (no watch mode) |
| `npm run test:watch` | Run tests in watch mode |

## Tech Stack

- React 19 + Vite 8
- Chart.js + react-chartjs-2
- Vitest for testing
- CoinGecko API (free tier - rate limited)
- No TypeScript

## Important Constraints

- **API rate limiting**: CoinGecko free tier is strict. Cache is set to 60s in `src/core/constants.js`. Do not remove it.
- **No lint/typecheck scripts** in package.json - but verify tests pass before commits.
- **Images are local**: Stored in `public/images/cryptos/` and `public/images/xstocks/`. Updated weekly via `scripts/refreshImages.py`.

## Deploy

- **Vercel**: Auto-deploys from GH commits. `vercel.json` rewrites all routes to `index.html` (SPA). Yahoo API proxy via `api/yahoo.js` serverless function.
- **Local production**: `npm run build && npm start` (Express server on `:3000` with Yahoo proxy).

## Repo Structure

```
src/
├── core/api.js         # All API calls (fetchCryptoData, fetchXStocks, fetchCoinHistory, etc.)
├── core/constants.js   # Configuration (API_URL, REFRESH_INTERVAL, CACHE_TTL, STABLECOINS, INDICES)
├── components/        # React components
├── pages/            # Page-level components (BoursePage, etc.)
└── styles/           # CSS files
api/yahoo.js             # Vercel serverless proxy for Yahoo Finance
server.js               # Express production server (alternative)
vercel.json             # Vercel config (SPA rewrites)
```

## Testing

- Tests use Vitest with jsdom
- Run single test file: `npx vitest run src/test/api.test.js`
- Global fetch is mocked in test setup

## Routing

- Uses `HashRouter` (react-router-dom v7) with two routes: `/` (CryptoWatch dashboard) and `/bourse` (indices & stocks)
- NavMenu component with hamburger icon for navigation between pages

## FEATURE.md

Contains planned features. Check it before implementing new functionality to see what's already planned or done.