import type { NextConfig } from 'next';

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

export default nextConfig;
