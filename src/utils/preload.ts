/**
 * Preload utility for tool components
 * Eagerly loads all tool components in the background for instant navigation
 */

// Tool component loaders
const TOOL_LOADERS: Record<string, () => Promise<unknown>> = {
  '/metronome': () => import('../apps/metronome/components/MetronomePlayer'),
  '/drum': () => import('../apps/drum/components/DrumMachine'),
  '/drum-synth': () => import('../apps/drum-synth/components/DrumSynth'),
  '/drum-tool': () => import('../apps/drum-tool/components/DrumTool'),
  '/qr': () => import('../apps/qr/components/QRGenerator'),
};

// Track which components have been preloaded
const preloadedComponents = new Set<string>();

/**
 * Preload a specific tool component
 */
export function preloadComponent(path: string): void {
  if (preloadedComponents.has(path)) return;

  const loader = TOOL_LOADERS[path];
  if (loader) {
    loader()
      .then(() => preloadedComponents.add(path))
      .catch(() => {});
  }
}

/**
 * Check if a component is already preloaded
 */
export function isPreloaded(path: string): boolean {
  return preloadedComponents.has(path);
}

/**
 * Preload all tool components in the background
 * Uses requestIdleCallback for non-blocking loading
 */
export function preloadAllTools(): void {
  const paths = Object.keys(TOOL_LOADERS);

  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePreload =
    typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 100);

  // Preload one component at a time during idle periods
  let index = 0;

  function preloadNext() {
    if (index >= paths.length) return;

    const path = paths[index++];
    preloadComponent(path);

    // Schedule next preload
    schedulePreload(preloadNext);
  }

  // Start preloading after a short delay to not interfere with initial render
  setTimeout(() => schedulePreload(preloadNext), 500);
}

/**
 * Get the loader for a specific path
 */
export function getLoader(path: string): (() => Promise<unknown>) | undefined {
  return TOOL_LOADERS[path];
}
