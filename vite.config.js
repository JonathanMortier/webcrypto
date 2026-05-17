import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import visualizer from 'rollup-plugin-visualizer';

const plugins = [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'images/icons/pwa-192x192.svg'],
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
          type: 'image/svg+xml'
        },
        {
          src: 'images/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'images/icons/pwa-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml'
        },
        {
          src: 'images/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'images/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    }
  })
];

if (process.env.ANALYZE) {
  plugins.push(visualizer({ filename: 'dist/stats.html' }));
}

export default defineConfig({
  plugins,
  base: './',
  server: {
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }
      }
    }
  },
  build: {
    minify: 'esbuild'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
