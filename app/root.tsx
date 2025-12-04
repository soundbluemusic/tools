import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from 'react-router';
import type { Route } from './+types/root';
import { ThemeProvider } from '../src/hooks/useTheme';
import { LanguageProvider } from '../src/i18n/context';
import { useApps } from '../src/hooks/useApps';
import { NavigationLayout } from '../src/components/navigation';
import { Footer } from '../src/components/Footer';
import { SkipLink } from '../src/components/SkipLink';
import './app.css';

/**
 * Links function for document head
 * Returns link tags for favicon, fonts, etc.
 */
export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/icons/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/icons/favicon-16x16.png',
  },
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/icons/apple-touch-icon.png',
  },
  { rel: 'manifest', href: '/manifest.webmanifest' },
];

/**
 * Meta function for document head
 * Returns default meta tags
 */
export const meta: Route.MetaFunction = () => [
  { charSet: 'utf-8' },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  },
  { title: 'Tools - Open Source Productivity Tools' },
  {
    name: 'description',
    content:
      '무료 온라인 도구 모음. QR 코드 생성기로 고해상도 QR코드를 만들고, 정밀 메트로놈으로 음악 연습을 하세요. 모든 도구 100% 무료, 회원가입 불필요!',
  },
  {
    name: 'keywords',
    content:
      'QR코드 생성기, 무료 QR코드, QR코드 만들기, 메트로놈 온라인, 무료 메트로놈, 온라인 도구, 무료 도구',
  },
  { name: 'author', content: 'SoundBlueMusic' },
  { name: 'robots', content: 'index, follow' },
  {
    name: 'theme-color',
    content: '#242424',
    media: '(prefers-color-scheme: dark)',
  },
  {
    name: 'theme-color',
    content: '#ffffff',
    media: '(prefers-color-scheme: light)',
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:url', content: 'https://tools.soundbluemusic.com/' },
  { property: 'og:title', content: 'Tools - Open Source Productivity Tools' },
  {
    property: 'og:description',
    content:
      '무료 온라인 도구 모음. QR 코드 생성기, 정밀 메트로놈 등 유용한 도구를 무료로 사용하세요.',
  },
  {
    property: 'og:image',
    content: 'https://tools.soundbluemusic.com/og-image.png',
  },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Tools - Open Source Productivity Tools' },
  {
    name: 'twitter:description',
    content:
      '무료 온라인 도구 모음. QR 코드 생성기, 정밀 메트로놈 등 유용한 도구를 무료로 사용하세요.',
  },
];

/**
 * Root Layout Component
 * Provides HTML document structure and global providers
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Meta />
        <Links />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Tools - Open Source Productivity Tools',
              description: '무료 온라인 도구 모음',
              url: 'https://tools.soundbluemusic.com/',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Any',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * App Content with Navigation
 */
function AppContent() {
  const { apps } = useApps();

  return (
    <NavigationLayout apps={apps}>
      <SkipLink />
      <main id="main-content" className="main-content" role="main">
        <Outlet />
      </main>
      <Footer />
    </NavigationLayout>
  );
}

/**
 * Root Component
 * Main application entry point with providers
 */
export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

/**
 * Error Boundary Component
 * Handles route errors and displays appropriate error UI
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = '알 수 없는 오류가 발생했습니다';
  let details = '';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message =
      error.status === 404
        ? '페이지를 찾을 수 없습니다'
        : '오류가 발생했습니다';
    details = error.statusText || error.data?.message || '';
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="error-container">
      <div className="error-content">
        <h1 className="error-title">{message}</h1>
        {details && <p className="error-details">{details}</p>}
        {stack && (
          <pre className="error-stack">
            <code>{stack}</code>
          </pre>
        )}
        <a href="/" className="error-link">
          홈으로 돌아가기
        </a>
      </div>
    </main>
  );
}
