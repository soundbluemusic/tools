#!/usr/bin/env tsx
/**
 * Sitemap Generation Script
 *
 * Generates sitemap.xml from app configs and routes.
 * Automatically includes both English and Korean URLs.
 * Usage: npx tsx scripts/generate-sitemap.ts
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Types
interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority: number;
  alternates?: { lang: string; href: string }[];
}

interface RouteConfig {
  path: string;
  changefreq: SitemapUrl['changefreq'];
  priority: number;
}

// Configuration
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const appsDir = join(rootDir, 'src/apps');
const brandFile = join(rootDir, 'src/constants/brand.ts');
const outputFile = join(rootDir, 'public/sitemap.xml');

// Static routes
const STATIC_ROUTES: RouteConfig[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/sitemap', changefreq: 'monthly', priority: 0.5 },
  { path: '/opensource', changefreq: 'monthly', priority: 0.5 },
  { path: '/tools-used', changefreq: 'monthly', priority: 0.5 },
  { path: '/downloads', changefreq: 'monthly', priority: 0.5 },
  { path: '/music-tools', changefreq: 'monthly', priority: 0.6 },
  { path: '/combined-tools', changefreq: 'monthly', priority: 0.6 },
  { path: '/other-tools', changefreq: 'monthly', priority: 0.6 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { path: '/terms', changefreq: 'yearly', priority: 0.3 },
];

// App route config
const APP_ROUTE_CONFIG = {
  changefreq: 'monthly' as const,
  priority: 0.8,
};

// Get today's date
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Extract siteUrl from brand.ts
async function getSiteUrl(): Promise<string> {
  try {
    const content = await readFile(brandFile, 'utf-8');
    const match = content.match(/siteUrl:\s*['"]([^'"]+)['"]/);
    if (match) {
      return match[1];
    }
  } catch {
    console.warn('Warning: Could not read brand.ts, using default URL');
  }
  return 'https://example.com';
}

// Get all app folder names
async function getAppRoutes(): Promise<string[]> {
  try {
    const entries = await readdir(appsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => '/' + entry.name);
  } catch {
    console.warn('Warning: Could not read apps directory');
    return [];
  }
}

// Generate XML for a single URL with hreflang alternates
function generateUrlEntry(url: SitemapUrl): string {
  const alternatesXml = url.alternates
    ? url.alternates
        .map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}"/>`
        )
        .join('\n')
    : '';

  return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
${alternatesXml}  </url>`;
}

// Generate complete sitemap XML
function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(generateUrlEntry).join('\n\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

${urlEntries}

</urlset>
`;
}

// Main
async function main() {
  console.log('Generating sitemap.xml...');

  const siteUrl = await getSiteUrl();
  console.log('Site URL:', siteUrl);

  const appRoutes = await getAppRoutes();
  console.log('Found apps:', appRoutes.join(', '));

  const today = getToday();
  const urls: SitemapUrl[] = [];

  // Helper to create URL entries with alternates
  const createUrlEntry = (
    path: string,
    changefreq: SitemapUrl['changefreq'],
    priority: number
  ): void => {
    const enPath = path === '/' ? '' : path;
    const koPath = path === '/' ? '/ko' : `/ko${path}`;

    // English version
    urls.push({
      loc: siteUrl + enPath,
      lastmod: today,
      changefreq,
      priority,
      alternates: [
        { lang: 'en', href: siteUrl + enPath },
        { lang: 'ko', href: siteUrl + koPath },
        { lang: 'x-default', href: siteUrl + enPath },
      ],
    });

    // Korean version
    urls.push({
      loc: siteUrl + koPath,
      lastmod: today,
      changefreq,
      priority,
      alternates: [
        { lang: 'en', href: siteUrl + enPath },
        { lang: 'ko', href: siteUrl + koPath },
        { lang: 'x-default', href: siteUrl + enPath },
      ],
    });
  };

  // Add static routes (both EN and KO)
  for (const route of STATIC_ROUTES) {
    createUrlEntry(route.path, route.changefreq, route.priority);
  }

  // Add app routes (both EN and KO)
  for (const appPath of appRoutes) {
    createUrlEntry(
      appPath,
      APP_ROUTE_CONFIG.changefreq,
      APP_ROUTE_CONFIG.priority
    );
  }

  // Sort by priority then path
  urls.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.loc.localeCompare(b.loc);
  });

  const xml = generateSitemapXml(urls);
  await writeFile(outputFile, xml, 'utf-8');

  console.log('Generated sitemap.xml with', urls.length, 'URLs');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
