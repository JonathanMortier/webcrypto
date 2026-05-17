# Session Context — 2026-05-17

## Goal
Maintain and improve a React crypto dashboard app (CryptoWatch) with crypto tracking, bourse page, and Vercel deployment.

## Constraints & Preferences
- Node 20 on user's machine; prefers nvm to upgrade (use Node 22 for dev).
- CoinGecko free tier: strict rate limiting, cache must stay (CACHE_TTL=120s, REFRESH_INTERVAL=60s).
- No lint/typecheck scripts in package.json — verify tests before committing.
- Images stored locally in `public/images/cryptos/` and `public/images/xstocks/`, updated weekly via `scripts/refreshImages.py`.
- Vite dev server + Express prod server both proxy `/api/yahoo/*` to Yahoo Finance.
- Vercel deploy uses `api/yahoo.js` serverless function + `vercel.json` SPA rewrites.
- User is French — prefer French in explanations but code/commits in English.
- User merges feature branches into develop, then merges develop into main (PR on GitHub), then tags.

## Progress

### Done
- Fixed NASDAQ100 symbol: `NQSE.DE` → `SXRV.DE` in `constants.js:31`.
- Bumped indices cache key `indices_v2` → `indices_v3` to force re-fetch.
- Restructured Vercel API: created flat `api/yahoo.js` reading Yahoo path from `req.query.path`.
- Updated `vercel.json` with explicit rewrite for API path passthrough.
- Added rate limiting (`express-rate-limit`) to `server.js` catch-all route.
- Fixed `BoursePage.jsx:36` — added `setLoading(false)` in catch block.
- Updated `FEATURE.md` and `AGENTS.md`.
- Set up Vercel Web Analytics (`<Analytics />` in `App.jsx`).
- Rewrote `README.md` with table layouts.
- Filtered stablecoins in `scripts/refreshImages.py` (SKIP_SYMBOLS) and deleted 13 PNGs.
- Merged `feature/menu` into `develop`, then `develop` into `main`, tagged `v0.3.0`.
- Switched to `develop`, bumped version to `0.3.1-SNAPSHOT`, committed and pushed.
- Made version badge dynamic in README.md (`shields.io/github/package-json/v`).

### Current Branch
`develop` (ahead of `origin/develop` by 2 commits)

### Branches
- `main` — released version (v0.3.0)
- `develop` — v0.3.1-SNAPSHOT

## Key Decisions
- Used flat `api/yahoo.js` + Vercel rewrite instead of catch-all `[...slug].js`.
- Added rate limiter to `server.js` catch-all route (GitHub security alert).
- Injected stablecoin skip list into Python script rather than cross-language parsing.
- Used `shields.io/github/package-json/v` badge instead of manual version in README.

## Critical Context
- Express server on port 3000 conflicts with another service (Open WebUI) — use `PORT=3002 node server.js` to test locally.
- Yahoo Finance spark endpoint works with comma-separated symbols.
- Node 22 required for some deps (`http-proxy-middleware@4`, `rollup-plugin-visualizer@7`).
- CACHE_TTL=120s, REFRESH_INTERVAL=60s in `src/core/constants.js`.

## Relevant Files
- `src/core/constants.js`: STABLECOINS, INDICES, API config
- `src/core/api.js`: all API calls, cache, filterStablecoins, fetchIndicesData (indices_v3)
- `src/pages/BoursePage.jsx`: indices + stocks display, portfolio holdings
- `src/App.jsx`: main app, Analytics, routing, data fetching
- `api/yahoo.js`: Vercel serverless proxy for Yahoo Finance
- `server.js`: Express production server with proxy + rate limiter
- `vercel.json`: SPA rewrites with API route passthrough
- `scripts/refreshImages.py`: image download with SKIP_SYMBOLS filter
- `public/images/cryptos/`: local crypto PNGs (37 after filtering)
- `vite.config.js`: dev proxy for `/api/yahoo/*`
- `.opencode/context.md`: this file
