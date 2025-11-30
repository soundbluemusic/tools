import { useEffect } from 'react';
import { BASE_URL, DEFAULT_OG_IMAGE, SITE_NAME } from '../constants/site';

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
 * Custom hook for SEO optimization
 * Updates document title and meta tags dynamically for each page
 */
export function useSEO(config: SEOConfig): void {
  useEffect(() => {
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

    const fullTitle = isHomePage ? SITE_NAME : `${title} | ${SITE_NAME}`;
    const canonicalUrl = `${BASE_URL}${canonicalPath}`;

    // Update document title
    document.title = fullTitle;

    // Primary meta tags
    updateMetaTag('name', 'title', fullTitle);
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

    // Open Graph tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:site_name', SITE_NAME);

    // Twitter Card tags
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:url', canonicalUrl);
    updateMetaTag('name', 'twitter:image', ogImage);
  }, [config]);
}

export default useSEO;
