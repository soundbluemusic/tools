import { useCallback, useMemo } from 'react';
import {
  useLocation,
  useNavigate as useRouterNavigate,
} from 'react-router-dom';
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
 */
export function useLocalizedPath() {
  const { language } = useLanguage();

  /**
   * Convert a base path to a localized path
   */
  const toLocalizedPath = useCallback(
    (path: string): string => {
      return localizedPath(path, language);
    },
    [language]
  );

  /**
   * Get the current base path (without language prefix)
   */
  const location = useLocation();
  const basePath = useMemo(
    () => getBasePath(location.pathname),
    [location.pathname]
  );

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
 */
export function useLocalizedNavigate() {
  const navigate = useRouterNavigate();
  const { language } = useLanguage();

  return useCallback(
    (path: string, options?: NavigateOptions) => {
      const localPath = localizedPath(path, language);
      navigate(localPath, options);
    },
    [navigate, language]
  );
}
