/**
 * Vite Configuration for SvelteKit Frontend-Only PWA
 *
 * ARCHITECTURE: No Backend
 * - This app is 100% client-side with NO backend server
 * - PWA configuration enables full offline functionality
 * - All assets are cached by Service Worker for offline use
 * - Deployed as static files to Cloudflare Pages CDN
 */

import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Productivity Tools',
        short_name: 'Tools',
        description: 'Useful web utilities and productivity tools',
        theme_color: '#242424',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['utilities', 'productivity'],
        icons: [
          {
            src: 'icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'icons/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Tools Dashboard',
          },
          {
            src: 'icons/screenshot-narrow.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Tools Dashboard Mobile',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 250,
    assetsInlineLimit: 4096,
    modulePreload: {
      polyfill: false,
    },
  },
  optimizeDeps: {
    include: ['svelte'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
}));
