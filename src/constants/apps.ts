import type { App, AppConfig, AppList } from '../types';

/**
 * Music app paths - used for navigation grouping
 */
export const MUSIC_APP_PATHS = ['/metronome', '/drum', '/drum-synth'] as const;

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
 */
const appModules = import.meta.glob<{ default: AppConfig }>(
  '../apps/*/config.ts'
);

/** Cache for loaded apps */
let appsCache: App[] | null = null;
let loadingPromise: Promise<App[]> | null = null;

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
 * Load all apps asynchronously (lazy loading)
 * Results are cached for subsequent calls
 */
export async function loadApps(): Promise<App[]> {
  // Return cached apps if available
  if (appsCache) {
    return appsCache;
  }

  // Reuse existing loading promise to prevent duplicate loads
  if (loadingPromise) {
    return loadingPromise;
  }

  // Load all app configs in parallel
  loadingPromise = Promise.all(
    Object.entries(appModules).map(async ([path, loader]) => {
      const module = await loader();
      return [path, module] as const;
    })
  ).then((entries) => {
    const modules = Object.fromEntries(entries);
    appsCache = parseAppModules(modules);
    loadingPromise = null;
    return appsCache;
  });

  return loadingPromise;
}

/**
 * Get cached apps synchronously (returns empty array if not loaded)
 * Use loadApps() for guaranteed data
 */
export function getAppsSync(): AppList {
  return appsCache ? Object.freeze(appsCache) : [];
}

/** @deprecated Use loadApps() instead for lazy loading */
export const APPS: AppList = [];

/** Total number of loaded apps (0 until loaded) */
export const APPS_COUNT = 0;

/**
 * Find an app by its ID
 */
export function getAppById(id: number): App | undefined {
  return APPS.find((app) => app.id === id);
}

/**
 * Find an app by its URL
 */
export function getAppByUrl(url: string): App | undefined {
  return APPS.find((app) => app.url === url);
}
