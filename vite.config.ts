import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vitejs.dev/config/
// React Router v7 Framework Mode + Tailwind CSS v4 + WASM
export default defineConfig(({ mode }) => ({
  plugins: [
    // WASM support for audio/video/image processing
    wasm(),
    topLevelAwait(),
    // Tailwind CSS v4
    tailwindcss(),
    // React Router v7 Framework Mode
    reactRouter(),
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
    include: ['react', 'react-dom', 'react-router'],
    // Use esbuild for dependency optimization
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // Development server
  server: {
    // Pre-bundle dependencies for faster startup
    warmup: {
      clientFiles: ['./app/root.tsx', './app/routes.ts'],
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
