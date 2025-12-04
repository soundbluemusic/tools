import type { Config } from '@react-router/dev/config';

export default {
  // SPA 모드 활성화 (서버 런타임 없이 정적 호스팅)
  ssr: false,

  // 빌드 시 정적 HTML 생성 (Pre-rendering)
  // SEO를 위해 모든 라우트를 정적으로 렌더링
  async prerender() {
    return [
      // 메인 페이지
      '/',
      '/ko',
      // 카테고리 페이지
      '/music-tools',
      '/ko/music-tools',
      '/other-tools',
      '/ko/other-tools',
      '/combined-tools',
      '/ko/combined-tools',
      // 도구 페이지
      '/metronome',
      '/ko/metronome',
      '/drum',
      '/ko/drum',
      '/drum-synth',
      '/ko/drum-synth',
      '/drum-tool',
      '/ko/drum-tool',
      '/qr',
      '/ko/qr',
      // 정보 페이지
      '/sitemap',
      '/ko/sitemap',
      '/opensource',
      '/ko/opensource',
      '/tools-used',
      '/ko/tools-used',
      '/downloads',
      '/ko/downloads',
      // 법적 페이지
      '/privacy',
      '/ko/privacy',
      '/terms',
      '/ko/terms',
    ];
  },

  // 앱 디렉토리 (기본값: app)
  appDirectory: 'app',

  // 빌드 출력 디렉토리
  buildDirectory: 'dist',
} satisfies Config;
