import { useEffect } from 'react';
import { BRAND } from '../constants';
import { useLanguage } from '../i18n';
import {
  type SEOConfig,
  buildSEOMetaData,
  applySEOMetaTags,
} from '../utils/seo';

// Re-export types for consumers
export type { SEOConfig } from '../utils/seo';

const BASE_URL = BRAND.siteUrl;
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = BRAND.name;

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

  useEffect(() => {
    const meta = buildSEOMetaData(
      config,
      language,
      currentBasePath,
      BASE_URL,
      SITE_NAME,
      DEFAULT_OG_IMAGE
    );

    applySEOMetaTags(meta, SITE_NAME);
  }, [
    config.title,
    config.description,
    config.keywords,
    config.basePath,
    config.ogImage,
    config.ogType,
    config.noindex,
    config.isHomePage,
    language,
    currentBasePath,
  ]);
}

export default useSEO;
