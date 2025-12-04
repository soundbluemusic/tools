import type { App, AppConfig, AppList } from '../types';

/**
 * Music app paths - used for navigation grouping
 */
export const MUSIC_APP_PATHS = ['/metronome', '/drum', '/drum-synth'] as const;

/**
 * Combined/integrated app paths - used for navigation grouping
 */
export const COMBINED_APP_PATHS = ['/drum-tool'] as const;

/**
 * Auto-load apps from src/apps/[name]/config.ts
 *
 * Each app should have a config.ts file with:
 * - name: App display name
 * - desc: App description
 * - icon: Emoji icon
 * - size: Size in bytes (for sorting)
 * - order: Display order (optional, defaults to Infinity)
 *
 * The following are auto-generated:
 * - id: Generated from sorted index
 * - url: Generated from folder name (e.g., /contract, /qr)
 *
 * NOTE: Using { eager: true } for synchronous loading
 * This is required for React Router Framework Mode pre-rendering
 */
const appModules = import.meta.glob<{ default: AppConfig }>(
  '../apps/*/config.ts',
  { eager: true }
);

/** Cached apps list - loaded synchronously at module initialization */
let appsCache: App[] | null = null;

/**
 * Parse loaded app modules into App objects
 * Sorted by order field for stable ordering across environments
 */
function parseAppModules(
  modules: Record<string, { default: AppConfig }>
): App[] {
  const apps = Object.entries(modules).map(([path, module]) => {
    // Extract folder name from path: '../apps/contract/config.ts' -> 'contract'
    const pathParts = path.split('/');
    const folderName = pathParts[pathParts.length - 2];

    return {
      ...module.default,
      url: `/${folderName}`,
    };
  });

  // Sort by order field (lower = first), then by name for stability
  apps.sort((a, b) => {
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    // Fallback to name for apps without order
    return a.name.en.localeCompare(b.name.en);
  });

  // Assign stable IDs after sorting
  return apps.map((app, index) => ({
    id: index + 1,
    ...app,
  }));
}

/**
 * Initialize apps from eagerly loaded modules
 * Called once at module initialization for SSR/pre-rendering support
 */
function initializeApps(): App[] {
  if (!appsCache) {
    appsCache = parseAppModules(appModules);
  }
  return appsCache;
}

// Initialize apps immediately for pre-rendering support
const INITIALIZED_APPS = initializeApps();

/**
 * Load all apps (synchronous with eager loading)
 * Results are cached for subsequent calls
 */
export async function loadApps(): Promise<App[]> {
  return INITIALIZED_APPS;
}

/**
 * Get apps synchronously
 * With eager loading, apps are always available
 */
export function getAppsSync(): AppList {
  return Object.freeze(INITIALIZED_APPS);
}

/** Apps list - available synchronously */
export const APPS: AppList = INITIALIZED_APPS;

/** Total number of loaded apps */
export const APPS_COUNT = INITIALIZED_APPS.length;

/**
 * Find an app by its ID
 */
export function getAppById(id: number): App | undefined {
  return INITIALIZED_APPS.find((app) => app.id === id);
}

/**
 * Find an app by its URL
 */
export function getAppByUrl(url: string): App | undefined {
  return INITIALIZED_APPS.find((app) => app.url === url);
}
