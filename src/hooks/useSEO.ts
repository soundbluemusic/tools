import { useEffect } from 'react';
import { BRAND } from '../constants';
import { useLanguage } from '../i18n';

interface SEOConfig {
  title?: string;
  description: string;
  keywords?: string;
  /** Base path without language prefix (e.g., '/metronome') */
  basePath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  isHomePage?: boolean;
}

const BASE_URL = BRAND.siteUrl;
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = BRAND.name;
const KO_PREFIX = '/ko';

/**
 * Update or create a meta tag
 */
function updateMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string
): void {
  let element = document.querySelector(
    `meta[${attribute}="${key}"]`
  ) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

/**
 * Update canonical link
 */
function updateCanonicalLink(url: string): void {
  let link = document.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}

/**
 * Update or create hreflang link
 */
function updateHreflangLink(hreflang: string, href: string): void {
  let link = document.querySelector(
    `link[rel="alternate"][hreflang="${hreflang}"]`
  ) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    document.head.appendChild(link);
  }

  link.href = href;
}

/**
 * Build localized URL for SEO
 * - ('/', 'ko') -> '/ko'
 * - ('/metronome', 'ko') -> '/ko/metronome'
 * - ('/', 'en') -> '/'
 * - ('/metronome', 'en') -> '/metronome'
 */
function buildLocalizedUrl(basePath: string, language: 'ko' | 'en'): string {
  if (language === 'en') {
    return BASE_URL + basePath;
  }
  // Korean: add /ko prefix
  if (basePath === '/') {
    return BASE_URL + KO_PREFIX;
  }
  return BASE_URL + KO_PREFIX + basePath;
}

/**
 * Custom hook for SEO optimization
 * Updates document title, meta tags, and hreflang links dynamically for each page
 *
 * Multilingual SEO:
 * - English (default): https://tools.soundbluemusic.com/metronome
 * - Korean: https://tools.soundbluemusic.com/ko/metronome
 */
export function useSEO(config: SEOConfig): void {
  const { language, basePath: currentBasePath } = useLanguage();

  const {
    title,
    description,
    keywords,
    basePath = currentBasePath,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    noindex = false,
    isHomePage = false,
  } = config;

  useEffect(() => {
    const fullTitle = isHomePage ? SITE_NAME : `${title} | ${SITE_NAME}`;

    // Build canonical URL for current language
    const canonicalUrl = buildLocalizedUrl(basePath, language);

    // Build alternate URLs for hreflang
    const enUrl = buildLocalizedUrl(basePath, 'en');
    const koUrl = buildLocalizedUrl(basePath, 'ko');

    // Update document title
    document.title = fullTitle;

    // Primary meta tags
    updateMetaTag('name', 'title', fullTitle);
    updateMetaTag('name', 'description', description);
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // Language meta tag
    updateMetaTag('name', 'language', language === 'ko' ? 'Korean' : 'English');

    // Robots
    updateMetaTag(
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // Canonical URL
    updateCanonicalLink(canonicalUrl);

    // Hreflang links for multilingual SEO
    updateHreflangLink('en', enUrl);
    updateHreflangLink('ko', koUrl);
    updateHreflangLink('x-default', enUrl); // English as default

    // Open Graph tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:site_name', SITE_NAME);
    updateMetaTag(
      'property',
      'og:locale',
      language === 'ko' ? 'ko_KR' : 'en_US'
    );
    updateMetaTag(
      'property',
      'og:locale:alternate',
      language === 'ko' ? 'en_US' : 'ko_KR'
    );

    // Twitter Card tags
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:url', canonicalUrl);
    updateMetaTag('name', 'twitter:image', ogImage);
  }, [
    title,
    description,
    keywords,
    basePath,
    ogImage,
    ogType,
    noindex,
    isHomePage,
    language,
  ]);
}

export default useSEO;
