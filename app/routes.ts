import { type RouteConfig, index, route } from '@react-router/dev/routes';

/**
 * Route Configuration
 * React Router v7 Framework Mode (SPA)
 *
 * 동일 컴포넌트를 영어/한국어 URL에서 재사용
 * 각 라우트에 고유 id 지정으로 중복 방지
 */
export default [
  // 홈페이지
  index('routes/home.tsx', { id: 'home' }),
  route('ko', 'routes/home.tsx', { id: 'ko-home' }),

  // 카테고리 페이지
  route('music-tools', 'routes/music-tools.tsx', { id: 'music-tools' }),
  route('ko/music-tools', 'routes/music-tools.tsx', { id: 'ko-music-tools' }),
  route('other-tools', 'routes/other-tools.tsx', { id: 'other-tools' }),
  route('ko/other-tools', 'routes/other-tools.tsx', { id: 'ko-other-tools' }),
  route('combined-tools', 'routes/combined-tools.tsx', {
    id: 'combined-tools',
  }),
  route('ko/combined-tools', 'routes/combined-tools.tsx', {
    id: 'ko-combined-tools',
  }),

  // 도구 페이지
  route('metronome', 'routes/metronome.tsx', { id: 'metronome' }),
  route('ko/metronome', 'routes/metronome.tsx', { id: 'ko-metronome' }),
  route('drum', 'routes/drum.tsx', { id: 'drum' }),
  route('ko/drum', 'routes/drum.tsx', { id: 'ko-drum' }),
  route('drum-synth', 'routes/drum-synth.tsx', { id: 'drum-synth' }),
  route('ko/drum-synth', 'routes/drum-synth.tsx', { id: 'ko-drum-synth' }),
  route('drum-tool', 'routes/drum-tool.tsx', { id: 'drum-tool' }),
  route('ko/drum-tool', 'routes/drum-tool.tsx', { id: 'ko-drum-tool' }),
  route('qr', 'routes/qr.tsx', { id: 'qr' }),
  route('ko/qr', 'routes/qr.tsx', { id: 'ko-qr' }),

  // 정보 페이지
  route('sitemap', 'routes/sitemap.tsx', { id: 'sitemap' }),
  route('ko/sitemap', 'routes/sitemap.tsx', { id: 'ko-sitemap' }),
  route('opensource', 'routes/opensource.tsx', { id: 'opensource' }),
  route('ko/opensource', 'routes/opensource.tsx', { id: 'ko-opensource' }),
  route('tools-used', 'routes/tools-used.tsx', { id: 'tools-used' }),
  route('ko/tools-used', 'routes/tools-used.tsx', { id: 'ko-tools-used' }),
  route('downloads', 'routes/downloads.tsx', { id: 'downloads' }),
  route('ko/downloads', 'routes/downloads.tsx', { id: 'ko-downloads' }),

  // 법적 페이지
  route('privacy', 'routes/privacy.tsx', { id: 'privacy' }),
  route('ko/privacy', 'routes/privacy.tsx', { id: 'ko-privacy' }),
  route('terms', 'routes/terms.tsx', { id: 'terms' }),
  route('ko/terms', 'routes/terms.tsx', { id: 'ko-terms' }),

  // 404 페이지 (catch-all)
  route('*', 'routes/not-found.tsx', { id: 'not-found' }),
] satisfies RouteConfig;
