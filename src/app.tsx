// @refresh reload
import { MetaProvider, Title, Meta, Link } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense, ErrorBoundary } from 'solid-js';
import { ThemeProvider } from './hooks/useTheme';
import { LanguageProvider } from './i18n/context';
import { useApps } from './hooks/useApps';
import { NavigationLayout } from './components/navigation';
import { Footer } from './components/Footer';
import { SkipLink } from './components/SkipLink';
import { Loader } from './components/ui';
import './app.css';

/**
 * Structured Data for SEO
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tools - Open Source Productivity Tools',
  description: '무료 온라인 도구 모음',
  url: 'https://tools.soundbluemusic.com/',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
};

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
          <Title>Tools - Open Source Productivity Tools</Title>
          <Meta charset="utf-8" />
          <Meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, viewport-fit=cover"
          />
          <Meta
            name="description"
            content="무료 온라인 도구 모음. QR 코드 생성기로 고해상도 QR코드를 만들고, 정밀 메트로놈으로 음악 연습을 하세요. 모든 도구 100% 무료, 회원가입 불필요!"
          />
          <Meta
            name="keywords"
            content="QR코드 생성기, 무료 QR코드, QR코드 만들기, 메트로놈 온라인, 무료 메트로놈, 온라인 도구, 무료 도구"
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
            content="Tools - Open Source Productivity Tools"
          />
          <Meta
            property="og:description"
            content="무료 온라인 도구 모음. QR 코드 생성기, 정밀 메트로놈 등 유용한 도구를 무료로 사용하세요."
          />
          <Meta
            property="og:image"
            content="https://tools.soundbluemusic.com/og-image.png"
          />
          <Meta name="twitter:card" content="summary_large_image" />
          <Meta
            name="twitter:title"
            content="Tools - Open Source Productivity Tools"
          />
          <Meta
            name="twitter:description"
            content="무료 온라인 도구 모음. QR 코드 생성기, 정밀 메트로놈 등 유용한 도구를 무료로 사용하세요."
          />
          <Link rel="preconnect" href="https://fonts.googleapis.com" />
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
          <Link rel="manifest" href="/manifest.webmanifest" />
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
                    <Suspense
                      fallback={
                        <div class="page-loader">
                          <Loader />
                        </div>
                      }
                    >
                      {props.children}
                    </Suspense>
                  </main>
                  <Footer />
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
