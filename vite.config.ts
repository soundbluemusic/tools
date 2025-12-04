import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// React Compiler configuration
// https://react.dev/learn/react-compiler
const ReactCompilerConfig = {
  target: '19', // React 19
};

// https://vitejs.dev/config/
// Cloudflare Pages 최적화 설정 + React Compiler (자동 메모이제이션)
export default defineConfig(({ mode }) => ({
  plugins: [
    // WASM support for audio/video/image processing
    wasm(),
    topLevelAwait(),
    react({
      // Use automatic JSX runtime for smaller bundles
      jsxRuntime: 'automatic',
      // Enable React Compiler for automatic memoization
      // Replaces manual memo(), useMemo(), useCallback()
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // Defer SW registration to after initial render
      injectRegister: null,
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Tools',
        short_name: 'Tools',
        description:
          'Free online tools - QR code generator, metronome, drum machine and more',
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
        // Cache strategies (including WASM files)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,wasm}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
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
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/soundbluemusic\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'soundblue-assets-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Clean up outdated caches
        cleanupOutdatedCaches: true,
        // Skip waiting for faster updates
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  build: {
    // Target modern browsers for smaller bundles (Cloudflare Edge 호환)
    target: 'esnext',
    // Use esbuild for fast minification (built-in)
    minify: 'esbuild',
    // CSS code splitting
    cssCodeSplit: true,
    // CSS minification target
    cssMinify: 'esbuild',
    // No source maps in production
    sourcemap: false,
    // Chunk splitting configuration
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal Cloudflare CDN caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core - 가장 안정적인 의존성
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('scheduler')
            ) {
              return 'react-vendor';
            }
            // React Router - 별도 청크로 분리 (업데이트 빈도 다름)
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // QRious 등 기타 라이브러리
            if (id.includes('qrious')) {
              return 'qr-vendor';
            }
          }
        },
        // Optimize chunk file names with content hash (Cloudflare immutable caching)
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
        // ES 모듈 형식 (최신 브라우저 최적화)
        format: 'es',
        // 청크 간 공유 코드 최적화
        compact: true,
      },
      // Tree shaking optimization
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        // 사용되지 않는 export 제거
        preset: 'recommended',
      },
    },
    // Report compressed size (Brotli/gzip)
    reportCompressedSize: true,
    // Chunk size warning limit (Cloudflare Pages 권장)
    chunkSizeWarningLimit: 250,
    // Asset inline limit - 작은 파일은 인라인 (네트워크 요청 감소)
    assetsInlineLimit: 4096,
    // 모듈 프리로드 폴리필 비활성화 (최신 브라우저만 지원)
    modulePreload: {
      polyfill: false,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // Use esbuild for dependency optimization
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // Development server
  server: {
    // Pre-bundle dependencies for faster startup
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx'],
    },
  },
  // Preview server config
  preview: {
    // Enable caching headers
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
  // esbuild options
  esbuild: {
    // Drop console in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
}));
