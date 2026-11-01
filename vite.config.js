import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import visualizer from 'rollup-plugin-visualizer';

const plugins = [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'images/icons/pwa-192x192.svg'],
    workbox: {
      navigateFallback: '/index.html',
    },
    manifest: {
      name: 'CryptoWatch',
      short_name: 'CryptoWatch',
      description: 'Suivre les cours des cryptomonnaies en temps réel',
      theme_color: '#1a1a2e',
      background_color: '#1a1a2e',
      display: 'standalone',
      start_url: '.',
      icons: [
        {
          src: 'images/icons/pwa-192x192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
        },
        {
          src: 'images/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'images/icons/pwa-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
        },
        {
          src: 'images/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'images/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
  }),
];

if (process.env.ANALYZE) {
  plugins.push(visualizer({ filename: 'dist/stats.html' }));
}

// Dev-only proxy for the weather endpoint: mirrors api/weather.js and injects the
// server-side WEATHER_API_KEY from .env so it never reaches the browser bundle.
const weatherDevProxy = (apiKey) => ({
  target: 'https://api.weatherapi.com',
  changeOrigin: true,
  rewrite: (path) => {
    const params = new URL(path, 'http://localhost').searchParams;
    const q = `${Number(params.get('lat')).toFixed(2)},${Number(params.get('lon')).toFixed(2)}`;
    return `/v1/current.json?${new URLSearchParams({ key: apiKey, q, aqi: 'no' })}`;
  },
});

export default defineConfig(({ mode }) => ({
  plugins,
  base: './',
  server: {
    proxy: {
      '/api/weather': weatherDevProxy(loadEnv(mode, process.cwd(), '').WEATHER_API_KEY || ''),
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      },
      '/api/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      },
    },
  },
  build: {
    minify: 'esbuild',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/test/**/*.test.{js,jsx}'],
    exclude: ['e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
    },
  },
}));
