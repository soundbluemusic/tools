import { createEffect, onCleanup } from 'solid-js';
import { isServer } from 'solid-js/web';
import { BRAND } from '../constants';

interface SoftwareAppConfig {
  name: string;
  description: string;
  applicationCategory:
    | 'MusicApplication'
    | 'DesignApplication'
    | 'UtilitiesApplication'
    | 'MultimediaApplication';
}

interface SEOConfig {
  title?: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  isHomePage?: boolean;
  /** SoftwareApplication schema for tool pages */
  softwareApp?: SoftwareAppConfig;
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
 * Update hreflang alternate links for multilingual SEO
 */
function updateHreflangLinks(canonicalPath: string): void {
  if (isServer || typeof document === 'undefined') return;

  // Remove existing hreflang links
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());

  // Normalize path (remove /ko prefix if present)
  const basePath = canonicalPath.startsWith('/ko')
    ? canonicalPath.slice(3) || '/'
    : canonicalPath;

  const enUrl = `${BASE_URL}${basePath}`;
  const koUrl = `${BASE_URL}/ko${basePath === '/' ? '' : basePath}`;

  // Add EN link
  const enLink = document.createElement('link');
  enLink.rel = 'alternate';
  enLink.hreflang = 'en';
  enLink.href = enUrl;
  document.head.appendChild(enLink);

  // Add KO link
  const koLink = document.createElement('link');
  koLink.rel = 'alternate';
  koLink.hreflang = 'ko';
  koLink.href = koUrl;
  document.head.appendChild(koLink);

  // Add x-default (defaults to English)
  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = enUrl;
  document.head.appendChild(defaultLink);
}

/**
 * Update SoftwareApplication JSON-LD schema
 */
function updateSoftwareAppSchema(
  config: SoftwareAppConfig,
  canonicalUrl: string
): void {
  if (isServer || typeof document === 'undefined') return;

  // Remove existing software app schema
  const existingScript = document.querySelector(
    'script[data-schema="software-app"]'
  );
  if (existingScript) {
    existingScript.remove();
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.name,
    description: config.description,
    applicationCategory: config.applicationCategory,
    url: canonicalUrl,
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: BRAND.copyrightHolder,
      url: BASE_URL,
    },
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema', 'software-app');
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
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

    // Hreflang links for multilingual SEO
    updateHreflangLinks(canonicalPath);

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

    // SoftwareApplication schema for tool pages
    if (config.softwareApp) {
      updateSoftwareAppSchema(config.softwareApp, canonicalUrl);
    }
  });
}

export default useSEO;
