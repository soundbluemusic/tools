import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    // Audio/WASM 파일 캐싱
    runtimeCaching: [
      {
        urlPattern: /\.(?:wasm|wav|mp3|ogg)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'audio-wasm-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(?:woff2?|ttf|otf|eot)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'font-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  // Cloudflare Pages 정적 배포
  output: 'export',
  trailingSlash: true,

  // 이미지 최적화 (정적 배포용)
  images: {
    unoptimized: true,
  },

  // WASM 지원
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // SharedArrayBuffer 지원을 위한 헤더는 Cloudflare에서 설정
    return config;
  },

  // Turbopack 설정
  experimental: {
    // React 19 지원
  },

  // 헤더 설정 (개발 환경용 - SharedArrayBuffer)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
