/**
 * Error Tracking Utility
 * Centralized error handling and reporting for the application
 *
 * Features:
 * - Global error handling (window.onerror, unhandledrejection)
 * - React Error Boundary integration
 * - Error fingerprinting for deduplication
 * - Breadcrumb trail for debugging
 * - Optional remote reporting
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  type: 'error' | 'unhandledrejection' | 'react' | 'manual';
  componentStack?: string;
  url: string;
  timestamp: number;
  fingerprint: string;
  breadcrumbs: Breadcrumb[];
  metadata?: Record<string, unknown>;
}

export interface Breadcrumb {
  type: 'navigation' | 'click' | 'console' | 'fetch' | 'custom';
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

type ErrorCallback = (error: ErrorInfo) => void;

// Internal state
const breadcrumbs: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 20;
const reportedFingerprints = new Set<string>();
let errorCallback: ErrorCallback | null = null;

/**
 * Generate error fingerprint for deduplication
 */
function generateFingerprint(message: string, stack?: string): string {
  const input = `${message}:${stack?.split('\n')[0] || ''}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `err_${Math.abs(hash).toString(16)}`;
}

/**
 * Add breadcrumb to trail
 */
export function addBreadcrumb(
  type: Breadcrumb['type'],
  message: string,
  data?: Record<string, unknown>
): void {
  breadcrumbs.push({
    type,
    message,
    timestamp: Date.now(),
    data,
  });

  // Limit breadcrumb count
  while (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
}

/**
 * Create error info object
 */
function createErrorInfo(
  error: Error | string,
  type: ErrorInfo['type'],
  componentStack?: string,
  metadata?: Record<string, unknown>
): ErrorInfo {
  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? undefined : error.stack;

  return {
    message,
    stack,
    type,
    componentStack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: Date.now(),
    fingerprint: generateFingerprint(message, stack),
    breadcrumbs: [...breadcrumbs],
    metadata,
  };
}

/**
 * Report error to callback
 */
function reportError(errorInfo: ErrorInfo): void {
  // Deduplicate errors
  if (reportedFingerprints.has(errorInfo.fingerprint)) {
    return;
  }
  reportedFingerprints.add(errorInfo.fingerprint);

  // Log to console in development
  if (import.meta.env.DEV) {
    console.group(`[Error Tracker] ${errorInfo.type}`);
    console.error('Message:', errorInfo.message);
    if (errorInfo.stack) console.error('Stack:', errorInfo.stack);
    if (errorInfo.componentStack)
      console.error('Component Stack:', errorInfo.componentStack);
    console.log('Breadcrumbs:', errorInfo.breadcrumbs);
    console.groupEnd();
  }

  // Call registered callback
  if (errorCallback) {
    try {
      errorCallback(errorInfo);
    } catch {
      // Prevent infinite loops
    }
  }
}

/**
 * Handle global errors
 */
function handleGlobalError(
  message: string | Event,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error
): boolean {
  const errorMessage =
    typeof message === 'string' ? message : (error?.message ?? 'Unknown error');
  const errorInfo = createErrorInfo(error ?? errorMessage, 'error', undefined, {
    source,
    lineno,
    colno,
  });

  reportError(errorInfo);
  return false; // Let default error handling continue
}

/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  const error =
    event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

  const errorInfo = createErrorInfo(error, 'unhandledrejection');
  reportError(errorInfo);
}

/**
 * Setup automatic breadcrumb collection
 */
function setupAutoBreadcrumbs(): void {
  if (typeof window === 'undefined') return;

  // Track navigation
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    addBreadcrumb('navigation', `Navigate to ${args[2]}`);
    return originalPushState.apply(this, args);
  };

  // Track clicks
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      const selector = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const className = target.className
        ? `.${target.className.split(' ').join('.')}`
        : '';
      addBreadcrumb('click', `Clicked ${selector}${id}${className}`);
    },
    { passive: true }
  );

  // Track fetch requests
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    addBreadcrumb('fetch', `Fetch ${init?.method || 'GET'} ${url}`);
    return originalFetch.apply(this, [input, init]);
  };
}

/**
 * Initialize error tracking
 */
export function initErrorTracker(callback?: ErrorCallback): void {
  if (typeof window === 'undefined') return;

  errorCallback = callback ?? null;

  // Setup global handlers
  window.onerror = handleGlobalError;
  window.onunhandledrejection = handleUnhandledRejection;

  // Setup auto breadcrumbs
  setupAutoBreadcrumbs();
}

/**
 * Capture error manually (for use in catch blocks)
 */
export function captureError(
  error: Error | string,
  metadata?: Record<string, unknown>
): void {
  const errorInfo = createErrorInfo(error, 'manual', undefined, metadata);
  reportError(errorInfo);
}

/**
 * Capture React error boundary errors
 */
export function captureReactError(
  error: Error,
  componentStack: string
): void {
  const errorInfo = createErrorInfo(error, 'react', componentStack);
  reportError(errorInfo);
}

/**
 * Create remote error reporter
 */
export function createRemoteReporter(
  endpoint: string
): (error: ErrorInfo) => void {
  return (error) => {
    const body = JSON.stringify({
      ...error,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
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

/**
 * Clear reported fingerprints (for testing)
 */
export function clearReportedErrors(): void {
  reportedFingerprints.clear();
}

/**
 * Clear breadcrumbs (for testing)
 */
export function clearBreadcrumbs(): void {
  breadcrumbs.length = 0;
}
