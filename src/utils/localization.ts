/**
 * Pure localization utility functions - no React dependency
 * Can be used in any TypeScript/JavaScript environment
 */

import type { Language } from '../i18n/types';

/**
 * Korean language prefix for URLs
 * English is the default language and has no prefix
 */
export const KO_PREFIX = '/ko';

/**
 * Extract language from URL path
 * @param pathname - URL pathname
 * @returns 'ko' if path starts with /ko, 'en' otherwise
 *
 * @example
 * getLanguageFromPath('/ko/metronome') // 'ko'
 * getLanguageFromPath('/metronome')    // 'en'
 */
export function getLanguageFromPath(pathname: string): Language {
  return pathname.startsWith(KO_PREFIX + '/') || pathname === KO_PREFIX
    ? 'ko'
    : 'en';
}

/**
 * Get the base path without language prefix
 * @param pathname - URL pathname
 * @returns Path without /ko prefix
 *
 * @example
 * getBasePath('/ko/metronome') // '/metronome'
 * getBasePath('/metronome')    // '/metronome'
 * getBasePath('/ko')           // '/'
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
 * @param basePath - Base path without language prefix
 * @param language - Target language
 * @returns Localized path
 *
 * @example
 * buildLocalizedPath('/', 'ko')         // '/ko'
 * buildLocalizedPath('/metronome', 'ko') // '/ko/metronome'
 * buildLocalizedPath('/', 'en')         // '/'
 * buildLocalizedPath('/metronome', 'en') // '/metronome'
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
 * Build full URL for a specific language
 * @param baseUrl - Site base URL (e.g., 'https://example.com')
 * @param basePath - Path without language prefix
 * @param language - Target language
 * @returns Full localized URL
 *
 * @example
 * buildLocalizedUrl('https://example.com', '/metronome', 'ko')
 * // 'https://example.com/ko/metronome'
 */
export function buildLocalizedUrl(
  baseUrl: string,
  basePath: string,
  language: Language
): string {
  return baseUrl + buildLocalizedPath(basePath, language);
}
