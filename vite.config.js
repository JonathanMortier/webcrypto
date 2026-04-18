import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
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
  ],
  base: './',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
