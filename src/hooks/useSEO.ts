import { createEffect, onCleanup } from 'solid-js';
import { isServer } from 'solid-js/web';
import { BRAND } from '../constants';

interface SEOConfig {
  title?: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  isHomePage?: boolean;
}

const BASE_URL = BRAND.siteUrl;
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = BRAND.name;

/**
 * Update or create a meta tag
 */
function updateMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string
): void {
  if (isServer || typeof document === 'undefined') return;

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
  if (isServer || typeof document === 'undefined') return;

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
 * Custom hook for SEO optimization
 * Updates document title and meta tags dynamically for each page
 *
 * Hydration-safe: Only runs on client
 */
export function useSEO(config: SEOConfig): void {
  createEffect(() => {
    // Skip during SSR
    if (isServer || typeof document === 'undefined') return;

    const {
      title,
      description,
      keywords,
      canonicalPath = '',
      ogImage = DEFAULT_OG_IMAGE,
      ogType = 'website',
      noindex = false,
      isHomePage = false,
    } = config;

    // For homepage, let the <Title> component handle the title (supports i18n)
    // For other pages, construct title with site name suffix
    const fullTitle = isHomePage ? null : `${title} | ${SITE_NAME}`;
    const canonicalUrl = `${BASE_URL}${canonicalPath}`;

    // Update document title (skip for homepage - handled by <Title> component)
    if (fullTitle) {
      document.title = fullTitle;
      updateMetaTag('name', 'title', fullTitle);
    }
    updateMetaTag('name', 'description', description);
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

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

    // Open Graph tags (skip title for homepage - handled by <Title> component)
    if (fullTitle) {
      updateMetaTag('property', 'og:title', fullTitle);
    }
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:site_name', SITE_NAME);

    // Twitter Card tags (skip title for homepage - handled by <Title> component)
    if (fullTitle) {
      updateMetaTag('name', 'twitter:title', fullTitle);
    }
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:url', canonicalUrl);
    updateMetaTag('name', 'twitter:image', ogImage);
  });
}

export default useSEO;
