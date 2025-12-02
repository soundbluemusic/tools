import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Language } from '../i18n/types';

/**
 * Korean language prefix for URLs
 * English is the default language and has no prefix
 */
export const KO_PREFIX = '/ko';

/**
 * Extract language from URL path
 * - /ko/* -> 'ko'
 * - /* -> 'en' (default)
 */
export function getLanguageFromPath(pathname: string): Language {
  return pathname.startsWith(KO_PREFIX + '/') || pathname === KO_PREFIX
    ? 'ko'
    : 'en';
}

/**
 * Get the base path without language prefix
 * - /ko/metronome -> /metronome
 * - /metronome -> /metronome
 */
export function getBasePath(pathname: string): string {
  if (pathname.startsWith(KO_PREFIX + '/')) {
    return pathname.slice(KO_PREFIX.length);
  }
  if (pathname === KO_PREFIX) {
    return '/';
  }
  return pathname;
}

/**
 * Build localized path for given language
 * - ('/', 'ko') -> '/ko'
 * - ('/metronome', 'ko') -> '/ko/metronome'
 * - ('/', 'en') -> '/'
 * - ('/metronome', 'en') -> '/metronome'
 */
export function buildLocalizedPath(
  basePath: string,
  language: Language
): string {
  if (language === 'en') {
    return basePath;
  }
  // Korean: add /ko prefix
  if (basePath === '/') {
    return KO_PREFIX;
  }
  return KO_PREFIX + basePath;
}

/**
 * Hook for language-aware routing
 * Provides utilities for handling localized paths
 */
export function useLocalizedPath() {
  const location = useLocation();
  const navigate = useNavigate();

  // Current language from URL
  const language = useMemo(
    () => getLanguageFromPath(location.pathname),
    [location.pathname]
  );

  // Base path without language prefix
  const basePath = useMemo(
    () => getBasePath(location.pathname),
    [location.pathname]
  );

  // Build path for current language
  const localizedPath = useCallback(
    (path: string): string => {
      return buildLocalizedPath(path, language);
    },
    [language]
  );

  // Build path for a specific language
  const pathForLanguage = useCallback(
    (path: string, targetLanguage: Language): string => {
      return buildLocalizedPath(path, targetLanguage);
    },
    []
  );

  // Switch to another language (navigates to new URL)
  const switchLanguage = useCallback(
    (targetLanguage: Language) => {
      const newPath = buildLocalizedPath(basePath, targetLanguage);
      navigate(newPath + location.search + location.hash, { replace: true });
    },
    [basePath, location.search, location.hash, navigate]
  );

  // Get alternate language URL for SEO
  const getAlternateUrl = useCallback(
    (baseUrl: string, targetLanguage: Language): string => {
      const targetPath = buildLocalizedPath(basePath, targetLanguage);
      return baseUrl + targetPath;
    },
    [basePath]
  );

  return {
    language,
    basePath,
    localizedPath,
    pathForLanguage,
    switchLanguage,
    getAlternateUrl,
  };
}

export default useLocalizedPath;
