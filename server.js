import express from 'express';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  }
};

app.use(
  '/api/yahoo',
  createProxyMiddleware({
    ...proxyConfig,
    target: 'https://query1.finance.yahoo.com',
    pathRewrite: { '^/api/yahoo': '' },
  })
);

app.use(
  '/api/coingecko',
  createProxyMiddleware({
    ...proxyConfig,
    target: 'https://api.coingecko.com',
    pathRewrite: { '^/api/coingecko': '' },
  })
);

app.use(express.static(path.join(__dirname, 'dist')));

app.use(limiter, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
