/**
 * Pure SEO utility functions - no React dependency
 * Can be used in any TypeScript/JavaScript environment
 */

import type { Language } from '../i18n/types';
import { buildLocalizedUrl } from './localization';

/** SEO configuration options */
export interface SEOConfig {
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

/** SEO meta tag data */
export interface SEOMetaData {
  fullTitle: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  enUrl: string;
  koUrl: string;
  ogImage: string;
  ogType: string;
  language: Language;
  noindex: boolean;
}

/**
 * Update or create a meta tag in the document head
 * @param attribute - Meta tag attribute type ('name' or 'property')
 * @param key - Attribute value (e.g., 'description', 'og:title')
 * @param content - Content value for the meta tag
 */
export function updateMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string
): void {
  if (typeof document === 'undefined') return;

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
 * Update the canonical link in the document head
 * @param url - Canonical URL
 */
export function updateCanonicalLink(url: string): void {
  if (typeof document === 'undefined') return;

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
 * Update or create an hreflang link for multilingual SEO
 * @param hreflang - Language code (e.g., 'en', 'ko', 'x-default')
 * @param href - URL for the language variant
 */
export function updateHreflangLink(hreflang: string, href: string): void {
  if (typeof document === 'undefined') return;

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
 * Update document title
 * @param title - Page title
 */
export function updateDocumentTitle(title: string): void {
  if (typeof document === 'undefined') return;
  document.title = title;
}

/**
 * Build SEO meta data from config
 * @param config - SEO configuration
 * @param language - Current language
 * @param basePath - Current base path
 * @param baseUrl - Site base URL
 * @param siteName - Site name
 * @param defaultOgImage - Default OG image URL
 * @returns Computed SEO meta data
 */
export function buildSEOMetaData(
  config: SEOConfig,
  language: Language,
  basePath: string,
  baseUrl: string,
  siteName: string,
  defaultOgImage: string
): SEOMetaData {
  const {
    title,
    description,
    keywords,
    basePath: configBasePath = basePath,
    ogImage = defaultOgImage,
    ogType = 'website',
    noindex = false,
    isHomePage = false,
  } = config;

  const fullTitle = isHomePage ? siteName : `${title} | ${siteName}`;
  const canonicalUrl = buildLocalizedUrl(baseUrl, configBasePath, language);
  const enUrl = buildLocalizedUrl(baseUrl, configBasePath, 'en');
  const koUrl = buildLocalizedUrl(baseUrl, configBasePath, 'ko');

  return {
    fullTitle,
    description,
    keywords,
    canonicalUrl,
    enUrl,
    koUrl,
    ogImage,
    ogType,
    language,
    noindex,
  };
}

/**
 * Apply all SEO meta tags to the document
 * @param meta - SEO meta data
 * @param siteName - Site name for og:site_name
 */
export function applySEOMetaTags(meta: SEOMetaData, siteName: string): void {
  const {
    fullTitle,
    description,
    keywords,
    canonicalUrl,
    enUrl,
    koUrl,
    ogImage,
    ogType,
    language,
    noindex,
  } = meta;

  // Update document title
  updateDocumentTitle(fullTitle);

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
  updateHreflangLink('x-default', enUrl);

  // Open Graph tags
  updateMetaTag('property', 'og:title', fullTitle);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:url', canonicalUrl);
  updateMetaTag('property', 'og:type', ogType);
  updateMetaTag('property', 'og:image', ogImage);
  updateMetaTag('property', 'og:site_name', siteName);
  updateMetaTag('property', 'og:locale', language === 'ko' ? 'ko_KR' : 'en_US');
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
}
