// @refresh reload
import { MetaProvider, Meta, Link } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense, ErrorBoundary, createSignal, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';
import { useLocation } from '@solidjs/router';
import { ThemeProvider } from './hooks/useTheme';
import { LanguageProvider } from './i18n/context';
import { useApps } from './hooks/useApps';
import { NavigationLayout } from './components/navigation';
import { Footer } from './components/Footer';
import { SkipLink } from './components/SkipLink';
import PWAPrompt from './components/PWAPrompt';
import './app.css';

/**
 * Structured Data for SEO
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tools - 모든 창작자를 위한 무료 도구',
  description:
    '음악가, 작가, 디자이너, 영상 제작자 — 모든 창작자를 위한 무료 온라인 도구. 회원가입 없이, 광고 없이, 완전히 무료.',
  url: 'https://tools.soundbluemusic.com/',
  applicationCategory: 'CreativeApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
};

/**
 * Page Transition Loader - Shows during route changes
 * Uses skeleton UI pattern for smooth transitions
 */
function PageTransitionLoader() {
  return (
    <div
      class="page-transition-loader"
      aria-busy="true"
      aria-label="Loading page..."
    >
      <div class="page-transition-skeleton">
        <div class="skeleton-header">
          <div
            class="skeleton skeleton--rounded"
            style={{ width: '60%', height: '2rem' }}
          />
          <div
            class="skeleton skeleton--rounded"
            style={{ width: '80%', height: '1rem', 'margin-top': '0.75rem' }}
          />
        </div>
        <div class="skeleton-content">
          <div
            class="skeleton skeleton--rounded"
            style={{ width: '100%', height: '300px' }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Error Fallback Component
 */
function ErrorFallback(err: Error, reset: () => void) {
  const isDev = import.meta.env.DEV;

  return (
    <main class="error-container">
      <div class="error-content">
        <h1 class="error-title">알 수 없는 오류가 발생했습니다</h1>
        {isDev && <p class="error-details">{err.message}</p>}
        {isDev && err.stack && (
          <pre class="error-stack">
            <code>{err.stack}</code>
          </pre>
        )}
        <button onClick={reset} class="error-link">
          다시 시도
        </button>
        <a href="/" class="error-link" style={{ 'margin-left': '1rem' }}>
          홈으로 돌아가기
        </a>
      </div>
    </main>
  );
}

/**
 * Root App Component
 */
export default function App() {
  const { apps } = useApps();

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Meta charset="utf-8" />
          <Meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, viewport-fit=cover"
          />
          <Meta
            name="description"
            content="음악가, 작가, 디자이너, 영상 제작자 — 모든 창작자를 위한 무료 온라인 도구. 메트로놈, 드럼머신, QR 코드 생성기 등. 회원가입 없이, 광고 없이, 완전히 무료!"
          />
          <Meta
            name="keywords"
            content="무료 창작 도구, 음악가 도구, 메트로놈, 드럼머신, QR코드 생성기, 무료 온라인 도구, 창작자 도구, free creative tools"
          />
          <Meta name="author" content="SoundBlueMusic" />
          <Meta name="robots" content="index, follow" />
          <Meta
            name="theme-color"
            content="#242424"
            media="(prefers-color-scheme: dark)"
          />
          <Meta
            name="theme-color"
            content="#ffffff"
            media="(prefers-color-scheme: light)"
          />
          <Meta property="og:type" content="website" />
          <Meta property="og:url" content="https://tools.soundbluemusic.com/" />
          <Meta
            property="og:title"
            content="Tools - 모든 창작자를 위한 무료 도구"
          />
          <Meta
            property="og:description"
            content="음악가, 작가, 디자이너, 영상 제작자 — 모든 창작자를 위한 무료 도구. 회원가입 없이 바로 사용하세요."
          />
          <Meta
            property="og:image"
            content="https://tools.soundbluemusic.com/og-image.png"
          />
          <Meta name="twitter:card" content="summary_large_image" />
          <Meta name="twitter:site" content="@soundbluemusic" />
          <Meta name="twitter:creator" content="@soundbluemusic" />
          <Meta
            name="twitter:title"
            content="Tools - 모든 창작자를 위한 무료 도구"
          />
          <Meta
            name="twitter:description"
            content="음악가, 작가, 디자이너, 영상 제작자 — 모든 창작자를 위한 무료 도구. 회원가입 없이 바로 사용하세요."
          />
          <Meta
            name="twitter:image"
            content="https://tools.soundbluemusic.com/og-image.png"
          />
          <Link rel="preconnect" href="https://fonts.googleapis.com" />
          <Link rel="dns-prefetch" href="https://github.com" />
          <Link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <Link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/icons/favicon-32x32.png"
          />
          <Link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/icons/favicon-16x16.png"
          />
          <Link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/icons/apple-touch-icon.png"
          />
          <Link rel="manifest" href="/_build/manifest.webmanifest" />
          <script
            type="application/ld+json"
            innerHTML={JSON.stringify(structuredData)}
          />
          <ThemeProvider>
            <LanguageProvider>
              <ErrorBoundary fallback={ErrorFallback}>
                <NavigationLayout apps={apps}>
                  <SkipLink />
                  <main id="main-content" class="main-content" role="main">
                    <Suspense fallback={<PageTransitionLoader />}>
                      <div class="page-content">{props.children}</div>
                    </Suspense>
                  </main>
                  <Footer />
                  <PWAPrompt />
                </NavigationLayout>
              </ErrorBoundary>
            </LanguageProvider>
          </ThemeProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
