/**
 * Vanilla TypeScript App - Main Application
 * Replaces React App.tsx with vanilla TypeScript
 */
import { router } from '../core/Router';
import type { RouteConfig } from '../core/Router';
import { themeStore, languageStore } from '../core/Store';
import { NavigationLayout } from './layouts/NavigationLayout';
import { APPS } from './config';
import {
  NotFoundPage,
  HomePage,
  PrivacyPage,
  TermsPage,
  SitemapPage,
  OpenSourcePage,
  ToolsUsedPage,
  QRPage,
  MetronomePage,
  DrumPage,
  DrumSynthPage,
  DownloadsPage,
  MusicToolsPage,
  OtherToolsPage,
  CombinedToolsPage,
} from './pages';

/**
 * Route configuration
 */
const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => new HomePage(),
    exact: true,
  },
  {
    path: '/privacy',
    component: () => new PrivacyPage(),
  },
  {
    path: '/terms',
    component: () => new TermsPage(),
  },
  {
    path: '/sitemap',
    component: () => new SitemapPage(),
  },
  {
    path: '/opensource',
    component: () => new OpenSourcePage(),
  },
  {
    path: '/tools-used',
    component: () => new ToolsUsedPage(),
  },
  {
    path: '/qr',
    component: () => new QRPage(),
  },
  {
    path: '/metronome',
    component: () => new MetronomePage(),
  },
  {
    path: '/drum',
    component: () => new DrumPage(),
  },
  {
    path: '/drum-synth',
    component: () => new DrumSynthPage(),
  },
  {
    path: '/downloads',
    component: () => new DownloadsPage(),
  },
  {
    path: '/music-tools',
    component: () => new MusicToolsPage(),
  },
  {
    path: '/other-tools',
    component: () => new OtherToolsPage(),
  },
  {
    path: '/combined-tools',
    component: () => new CombinedToolsPage(),
  },
];

/**
 * Initialize the application
 */
export function initApp(): void {
  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'system';
  const resolvedTheme =
    savedTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : savedTheme;
  themeStore.setState({ theme: resolvedTheme as 'light' | 'dark' });
  document.documentElement.setAttribute('data-theme', resolvedTheme);

  // Initialize language from URL (primary) or localStorage (fallback)
  const urlLang = router.getLanguageFromPath(window.location.pathname);
  const savedLang = localStorage.getItem('language') as 'ko' | 'en' | null;
  const browserLang = navigator.language.startsWith('ko') ? 'ko' : 'en';
  const initialLang = urlLang || savedLang || browserLang;
  languageStore.setState({ language: initialLang });
  localStorage.setItem('language', initialLang);

  // Sync languageStore when router detects language change from URL
  router.onLanguageChange((lang) => {
    languageStore.setState({ language: lang });
    localStorage.setItem('language', lang);
  });

  // Create navigation layout and mount to root
  const layout = new NavigationLayout({ apps: APPS });
  const rootEl = document.getElementById('root');
  if (rootEl) {
    layout.mount(rootEl);
  }

  // Get content container
  const contentEl = document.getElementById('app-content');
  if (!contentEl) {
    console.error('[Vanilla] #app-content not found');
    return;
  }

  // Configure router
  router
    .register(routes)
    .setContainer(contentEl)
    .setNotFoundComponent(() => new NotFoundPage())
    .setLoadingComponent(
      () => `
      <div class="flex items-center justify-center min-h-[200px]">
        <div class="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full"></div>
      </div>
    `
    )
    .start();

  console.log('[Vanilla] App initialized with router');
}

/**
 * Export for use in main.ts
 */
export { routes };

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
