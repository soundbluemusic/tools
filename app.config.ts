import { defineConfig } from '@solidjs/start/config';
import tailwindcss from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // SPA 모드 (서버 런타임 없이 정적 호스팅)
  server: {
    preset: 'static',
    prerender: {
      // 프리렌더링 비활성화 - SPA는 클라이언트 사이드 라우팅 사용
      routes: [],
      crawlLinks: false,
    },
  },

  vite: ({ mode }) => ({
    plugins: [
      // WASM support for audio/video/image processing
      wasm(),
      topLevelAwait(),
      // Tailwind CSS v4
      tailwindcss(),
      // PWA Support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png', 'og-image.png', 'robots.txt'],
        manifest: {
          name: 'Tools - Open Source Productivity Tools',
          short_name: 'Tools',
          description:
            '무료 온라인 도구 모음. QR 코드 생성기, 메트로놈, 드럼 머신 등 유용한 도구를 무료로 사용하세요.',
          theme_color: '#242424',
          background_color: '#1a1a1a',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          categories: ['utilities', 'music', 'productivity'],
          icons: [
            {
              src: '/icons/icon-72.png',
              sizes: '72x72',
              type: 'image/png',
            },
            {
              src: '/icons/icon-96.png',
              sizes: '96x96',
              type: 'image/png',
            },
            {
              src: '/icons/icon-128.png',
              sizes: '128x128',
              type: 'image/png',
            },
            {
              src: '/icons/icon-144.png',
              sizes: '144x144',
              type: 'image/png',
            },
            {
              src: '/icons/icon-152.png',
              sizes: '152x152',
              type: 'image/png',
            },
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-384.png',
              sizes: '384x384',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/icon-maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: '/icons/screenshot-wide.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Tools Dashboard',
            },
            {
              src: '/icons/screenshot-narrow.png',
              sizes: '640x1136',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Tools Mobile',
            },
          ],
        },
        workbox: {
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
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /\.(?:wasm)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'wasm-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      cssMinify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('solid-js')) {
                return 'solid-vendor';
              }
              if (id.includes('@solidjs/router')) {
                return 'router-vendor';
              }
              if (id.includes('qrious')) {
                return 'qr-vendor';
              }
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split('.').pop() || '';
            if (/png|jpe?g|svg|gif|webp|ico/i.test(ext)) {
              return 'assets/img/[name]-[hash][extname]';
            }
            if (/css/i.test(ext)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            if (/woff2?|ttf|eot/i.test(ext)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
          format: 'es',
          compact: true,
        },
        treeshake: {
          moduleSideEffects: 'no-external',
          propertyReadSideEffects: false,
          preset: 'recommended',
        },
      },
      reportCompressedSize: true,
      chunkSizeWarningLimit: 250,
      assetsInlineLimit: 4096,
      modulePreload: {
        polyfill: false,
      },
    },
    optimizeDeps: {
      include: ['solid-js', '@solidjs/router'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      legalComments: 'none',
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },
  }),
});
