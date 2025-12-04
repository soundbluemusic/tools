import { createMemo, createSignal, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';
import { useNavigate as useRouterNavigate } from '@solidjs/router';
import { useLanguage } from '../i18n';
import type { Language } from '../i18n/types';

/**
 * Korean language prefix for SEO
 * English uses root path (no prefix)
 */
const KOREAN_PREFIX = '/ko';

/**
 * Get the language prefix for a given language
 */
export function getLanguagePrefix(language: Language): string {
  return language === 'ko' ? KOREAN_PREFIX : '';
}

/**
 * Add language prefix to a path
 */
export function localizedPath(path: string, language: Language): string {
  const prefix = getLanguagePrefix(language);
  if (!prefix) return path;

  // Handle root path
  if (path === '/') return prefix;

  // Add prefix to path
  return `${prefix}${path}`;
}

/**
 * Remove language prefix from a path (get base path)
 */
export function getBasePath(pathname: string): string {
  if (pathname.startsWith(KOREAN_PREFIX)) {
    const basePath = pathname.slice(KOREAN_PREFIX.length);
    return basePath || '/';
  }
  return pathname;
}

/**
 * Get language from URL path
 */
export function getLanguageFromPath(pathname: string): Language {
  return pathname.startsWith(KOREAN_PREFIX) ? 'ko' : 'en';
}

/**
 * Hook for generating localized paths
 * Returns a function that adds language prefix to paths
 *
 * Hydration-safe: uses consistent values, updates after mount
 */
export function useLocalizedPath() {
  const { language } = useLanguage();

  // Use consistent default value for SSR and initial client render
  const [pathname, setPathname] = createSignal('/');

  // Update pathname after mount (client-only)
  onMount(() => {
    setPathname(window.location.pathname);
  });

  /**
   * Convert a base path to a localized path
   */
  const toLocalizedPath = (path: string): string => {
    return localizedPath(path, language());
  };

  /**
   * Get the current base path (without language prefix)
   */
  const basePath = createMemo(() => getBasePath(pathname()));

  return {
    toLocalizedPath,
    basePath,
    language,
  };
}

/**
 * Navigation options type
 */
interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

/**
 * Custom navigate hook that adds language prefix
 * Hydration-safe: navigation only works on client
 */
export function useLocalizedNavigate() {
  const { language } = useLanguage();

  // Get navigate function only on client
  const navigate = isServer ? null : useRouterNavigate();

  return (path: string, options?: NavigateOptions) => {
    if (!navigate) return;
    const localPath = localizedPath(path, language());
    navigate(localPath, options);
  };
}
