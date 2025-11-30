/**
 * Site-wide constants
 * Centralized configuration to avoid hardcoding values across the codebase
 */

/** Base URL for the site (used in SEO, sitemap, canonical URLs) */
export const BASE_URL = 'https://tools.soundbluemusic.com';

/** Site name displayed in titles and metadata */
export const SITE_NAME = 'Productivity Tools';

/** Default Open Graph image path */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Get today's date in YYYY-MM-DD format
 * Used for sitemap lastmod dates
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
