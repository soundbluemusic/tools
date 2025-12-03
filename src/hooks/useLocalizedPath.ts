import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Language } from '../i18n/types';
import {
  getLanguageFromPath,
  getBasePath,
  buildLocalizedPath,
  buildLocalizedUrl,
} from '../utils/localization';

// Re-export pure functions for backwards compatibility
export {
  KO_PREFIX,
  getLanguageFromPath,
  getBasePath,
  buildLocalizedPath,
} from '../utils/localization';

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
      return buildLocalizedUrl(baseUrl, basePath, targetLanguage);
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
