import express from 'express';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import weatherHandler from './api/weather.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env (e.g. WEATHER_API_KEY) if present; real environment variables take precedence.
try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch {
  // No .env file: rely on the environment.
}
const PORT = process.env.PORT || 5173;

const app = express();
app.disable('x-powered-by');

// Single source of truth for security headers (CSP, HSTS, ...): vercel.json.
const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
const securityHeaders = vercelConfig.headers.find((h) => h.source === '/(.*)').headers;

const limiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const proxyConfig = {
  changeOrigin: true,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  },
};

app.use((_req, res, next) => {
  for (const { key, value } of securityHeaders) res.setHeader(key, value);
  next();
});

app.use('/api', limiter);

app.get('/api/weather', weatherHandler);

app.use(
  '/api/yahoo',
  createProxyMiddleware({
    ...proxyConfig,
    target: 'https://query1.finance.yahoo.com',
    pathRewrite: { '^/api/yahoo': '' },
  }),
);

app.use(
  '/api/coingecko',
  createProxyMiddleware({
    ...proxyConfig,
    target: 'https://api.coingecko.com',
    pathRewrite: { '^/api/coingecko': '' },
  }),
);

app.use(express.static(path.join(__dirname, 'dist')));

app.use(limiter, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
