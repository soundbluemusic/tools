import { type RouteConfig, index, route } from '@react-router/dev/routes';

/**
 * Route Configuration
 * React Router v7 Framework Mode (SPA)
 *
 * 옵션 언어 세그먼트: /:lang? 형태로 처리
 * 영어(기본) + 한국어(/ko) 지원
 */
export default [
  // 홈페이지
  index('routes/home.tsx'),

  // 카테고리 페이지
  route('music-tools', 'routes/music-tools.tsx'),
  route('other-tools', 'routes/other-tools.tsx'),
  route('combined-tools', 'routes/combined-tools.tsx'),

  // 도구 페이지
  route('metronome', 'routes/metronome.tsx'),
  route('drum', 'routes/drum.tsx'),
  route('drum-synth', 'routes/drum-synth.tsx'),
  route('drum-tool', 'routes/drum-tool.tsx'),
  route('qr', 'routes/qr.tsx'),

  // 정보 페이지
  route('sitemap', 'routes/sitemap.tsx'),
  route('opensource', 'routes/opensource.tsx'),
  route('tools-used', 'routes/tools-used.tsx'),
  route('downloads', 'routes/downloads.tsx'),

  // 법적 페이지
  route('privacy', 'routes/privacy.tsx'),
  route('terms', 'routes/terms.tsx'),

  // 한국어 홈페이지 (/ko)
  route('ko', 'routes/ko.home.tsx'),

  // 한국어 페이지들 (/ko/*)
  route('ko/music-tools', 'routes/ko.music-tools.tsx'),
  route('ko/other-tools', 'routes/ko.other-tools.tsx'),
  route('ko/combined-tools', 'routes/ko.combined-tools.tsx'),
  route('ko/metronome', 'routes/ko.metronome.tsx'),
  route('ko/drum', 'routes/ko.drum.tsx'),
  route('ko/drum-synth', 'routes/ko.drum-synth.tsx'),
  route('ko/drum-tool', 'routes/ko.drum-tool.tsx'),
  route('ko/qr', 'routes/ko.qr.tsx'),
  route('ko/sitemap', 'routes/ko.sitemap.tsx'),
  route('ko/opensource', 'routes/ko.opensource.tsx'),
  route('ko/tools-used', 'routes/ko.tools-used.tsx'),
  route('ko/downloads', 'routes/ko.downloads.tsx'),
  route('ko/privacy', 'routes/ko.privacy.tsx'),
  route('ko/terms', 'routes/ko.terms.tsx'),

  // 404 페이지 (catch-all)
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
