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

  // Initialize language from localStorage
  const savedLang =
    localStorage.getItem('language') ||
    (navigator.language.startsWith('ko') ? 'ko' : 'en');
  languageStore.setState({ language: savedLang as 'ko' | 'en' });

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
