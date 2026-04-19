# CryptoWatch - Agent Instructions

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on http://localhost:5173 |
| `npm run build` | Production build |
| `npm run test` | Run all tests (no watch mode) |

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

## Repo Structure

```
src/
├── core/api.js         # All API calls (fetchCryptoData, fetchXStocks, fetchCoinHistory, etc.)
├── core/constants.js   # Configuration (API_URL, REFRESH_INTERVAL, CACHE_TTL, STABLECOINS)
├── components/        # React components
└── styles/           # CSS files
```

## Testing

- Tests use Vitest with jsdom
- Run single test file: `npx vitest run src/test/api.test.js`
- Global fetch is mocked in test setup

## FEATURE.md

Contains planned features. Check it before implementing new functionality to see what's already planned or done.