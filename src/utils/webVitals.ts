/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals metrics for performance optimization
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response
 * - INP (Interaction to Next Paint): Responsiveness
 */

export interface WebVitalsMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

type ReportCallback = (metric: WebVitalsMetric) => void;

/** Thresholds for rating metrics */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

/**
 * Calculate rating based on value and thresholds
 */
function getRating(
  name: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Generate unique metric ID
 */
function generateId(): string {
  return `v4-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get navigation type
 */
function getNavigationType(): string {
  if (typeof window === 'undefined') return 'unknown';

  const navEntry = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming | undefined;

  return navEntry?.type || 'navigate';
}

/**
 * Report metric to callback and optionally to analytics
 */
function reportMetric(
  name: WebVitalsMetric['name'],
  value: number,
  callback: ReportCallback
) {
  const metric: WebVitalsMetric = {
    name,
    value,
    rating: getRating(name, value),
    delta: value,
    id: generateId(),
    navigationType: getNavigationType(),
  };

  callback(metric);

  // Log to console in development
  if (import.meta.env.DEV) {
    const color =
      metric.rating === 'good'
        ? '#0cce6b'
        : metric.rating === 'needs-improvement'
          ? '#ffa400'
          : '#ff4e42';

    console.log(
      `%c[Web Vitals] ${name}: ${value.toFixed(2)} (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
}

/**
 * Observe Largest Contentful Paint
 */
function observeLCP(callback: ReportCallback) {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number;
      };
      if (lastEntry) {
        reportMetric('LCP', lastEntry.startTime, callback);
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // LCP not supported
  }
}

/**
 * Observe First Input Delay
 */
function observeFID(callback: ReportCallback) {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & {
        processingStart: number;
        startTime: number;
      })[];
      const firstEntry = entries[0];
      if (firstEntry) {
        const value = firstEntry.processingStart - firstEntry.startTime;
        reportMetric('FID', value, callback);
      }
    });

    observer.observe({ type: 'first-input', buffered: true });
  } catch {
    // FID not supported
  }
}

/**
 * Observe Cumulative Layout Shift
 */
function observeCLS(callback: ReportCallback) {
  if (typeof PerformanceObserver === 'undefined') return;

  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & {
        hadRecentInput: boolean;
        value: number;
        startTime: number;
      })[];

      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0] as
            | (PerformanceEntry & { startTime: number })
            | undefined;
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1] as
            | (PerformanceEntry & { startTime: number })
            | undefined;

          if (
            sessionValue &&
            firstSessionEntry &&
            lastSessionEntry &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            reportMetric('CLS', clsValue, callback);
          }
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // CLS not supported
  }
}

/**
 * Observe First Contentful Paint
 */
function observeFCP(callback: ReportCallback) {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === 'first-contentful-paint'
      ) as PerformanceEntry & { startTime: number } | undefined;
      if (fcpEntry) {
        reportMetric('FCP', fcpEntry.startTime, callback);
        observer.disconnect();
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  } catch {
    // FCP not supported
  }
}

/**
 * Observe Time to First Byte
 */
function observeTTFB(callback: ReportCallback) {
  try {
    const navEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming | undefined;

    if (navEntry) {
      reportMetric('TTFB', navEntry.responseStart, callback);
    }
  } catch {
    // TTFB not supported
  }
}

/**
 * Observe Interaction to Next Paint
 */
function observeINP(callback: ReportCallback) {
  if (typeof PerformanceObserver === 'undefined') return;

  const interactions: number[] = [];

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & {
        interactionId: number;
        duration: number;
      })[];

      for (const entry of entries) {
        if (entry.interactionId) {
          interactions.push(entry.duration);
        }
      }

      if (interactions.length > 0) {
        // INP is the 98th percentile of interactions
        interactions.sort((a, b) => b - a);
        const index = Math.min(
          interactions.length - 1,
          Math.floor(interactions.length / 50)
        );
        reportMetric('INP', interactions[index], callback);
      }
    });

    // durationThreshold is part of the Event Timing API but not in all TS definitions
    observer.observe({
      type: 'event',
      buffered: true,
      durationThreshold: 16,
    } as PerformanceObserverInit);
  } catch {
    // INP not supported
  }
}

/**
 * Initialize Web Vitals monitoring
 * @param callback - Function called for each metric
 */
export function initWebVitals(callback: ReportCallback): void {
  if (typeof window === 'undefined') return;

  // Wait for page to be fully loaded
  if (document.readyState === 'complete') {
    observeLCP(callback);
    observeFID(callback);
    observeCLS(callback);
    observeFCP(callback);
    observeTTFB(callback);
    observeINP(callback);
  } else {
    window.addEventListener('load', () => {
      observeLCP(callback);
      observeFID(callback);
      observeCLS(callback);
      observeFCP(callback);
      observeTTFB(callback);
      observeINP(callback);
    });
  }
}

/**
 * Default reporter that logs to console
 */
export function consoleReporter(metric: WebVitalsMetric): void {
  console.log('[Web Vitals]', metric);
}

/**
 * Send metrics to analytics endpoint
 */
export function createAnalyticsReporter(
  endpoint: string
): (metric: WebVitalsMetric) => void {
  return (metric) => {
    const body = JSON.stringify({
      ...metric,
      url: window.location.href,
      timestamp: Date.now(),
    });

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      fetch(endpoint, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Silently fail
      });
    }
  };
}
