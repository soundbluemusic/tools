/**
 * Vanilla TypeScript Router
 * Replaces React Router with History API based routing
 */

import type { Component } from './Component';

export interface RouteConfig {
  path: string;
  component: () => Promise<{ default: new () => Component }> | Component;
  exact?: boolean;
}

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
}

export type RouteChangeListener = (
  match: RouteMatch | null,
  prevMatch: RouteMatch | null
) => void;

/**
 * Router class using History API
 */
class RouterClass {
  private routes: RouteConfig[] = [];
  private currentMatch: RouteMatch | null = null;
  private currentComponent: Component | null = null;
  private container: HTMLElement | null = null;
  private listeners: Set<RouteChangeListener> = new Set();
  private loadingComponent: (() => string) | null = null;
  private notFoundComponent: (() => Component) | null = null;

  constructor() {
    // Listen for browser back/forward
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });
  }

  /**
   * Register routes
   */
  register(routes: RouteConfig[]): this {
    this.routes = routes;
    return this;
  }

  /**
   * Set the container element for rendering
   */
  setContainer(container: HTMLElement | string): this {
    this.container =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;
    return this;
  }

  /**
   * Set loading component shown during lazy loading
   */
  setLoadingComponent(component: () => string): this {
    this.loadingComponent = component;
    return this;
  }

  /**
   * Set 404 component
   */
  setNotFoundComponent(component: () => Component): this {
    this.notFoundComponent = component;
    return this;
  }

  /**
   * Start the router
   */
  start(): this {
    this.handleRouteChange();
    return this;
  }

  /**
   * Navigate to a path
   */
  navigate(path: string, options: { replace?: boolean } = {}): void {
    if (options.replace) {
      history.replaceState(null, '', path);
    } else {
      history.pushState(null, '', path);
    }
    this.handleRouteChange();
  }

  /**
   * Go back in history
   */
  back(): void {
    history.back();
  }

  /**
   * Go forward in history
   */
  forward(): void {
    history.forward();
  }

  /**
   * Subscribe to route changes
   */
  subscribe(listener: RouteChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current route match
   */
  getCurrentMatch(): RouteMatch | null {
    return this.currentMatch;
  }

  /**
   * Get current path
   */
  getCurrentPath(): string {
    return window.location.pathname;
  }

  /**
   * Handle route change
   */
  private async handleRouteChange(): Promise<void> {
    const path = window.location.pathname;
    const query = new URLSearchParams(window.location.search);
    const prevMatch = this.currentMatch;

    // Find matching route
    const matchResult = this.matchRoute(path);

    if (!matchResult) {
      // 404 - Not Found
      this.currentMatch = null;

      if (this.currentComponent) {
        this.currentComponent.unmount();
        this.currentComponent = null;
      }

      if (this.notFoundComponent && this.container) {
        const notFound = this.notFoundComponent();
        notFound.mount(this.container);
        this.currentComponent = notFound;
      }

      this.notifyListeners(null, prevMatch);
      return;
    }

    const { route, params } = matchResult;

    this.currentMatch = { path, params, query };

    // Unmount current component
    if (this.currentComponent) {
      this.currentComponent.unmount();
      this.currentComponent = null;
    }

    // Show loading state if lazy loading
    if (this.loadingComponent && this.container) {
      this.container.innerHTML = this.loadingComponent();
    }

    try {
      // Load component (supports lazy loading and direct instances)
      const result = route.component();
      let component: Component;

      if (result instanceof Promise) {
        // Lazy loading: returns Promise<{ default: ComponentClass }>
        const module = await result;
        const ComponentClass = module.default;
        component = new ComponentClass();
      } else {
        // Direct instance: component() returns new SomePage()
        component = result as Component;
      }

      // Mount new component
      if (this.container) {
        component.mount(this.container);
        this.currentComponent = component;
      }

      // Notify listeners
      this.notifyListeners(this.currentMatch, prevMatch);
    } catch (error) {
      console.error('Failed to load route component:', error);

      if (this.notFoundComponent && this.container) {
        const notFound = this.notFoundComponent();
        notFound.mount(this.container);
        this.currentComponent = notFound;
      }
    }
  }

  /**
   * Match a path against registered routes
   */
  private matchRoute(
    path: string
  ): { route: RouteConfig; params: Record<string, string> } | null {
    for (const route of this.routes) {
      const params = this.matchPath(path, route.path, route.exact);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }

  /**
   * Match a path against a route pattern
   */
  private matchPath(
    path: string,
    pattern: string,
    exact = false
  ): Record<string, string> | null {
    // Handle exact match
    if (exact && path === pattern) {
      return {};
    }

    // Convert pattern to regex
    // Escape special regex characters in pattern (backslash first, then others)
    const paramNames: string[] = [];
    const regexPattern = pattern
      .replace(/\\/g, '\\\\')
      .replace(/\//g, '\\/')
      .replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');

    const regex = exact
      ? new RegExp(`^${regexPattern}$`)
      : new RegExp(`^${regexPattern}(?:\\/|$)`);

    const match = path.match(regex);

    if (!match) {
      return null;
    }

    // Extract params
    const params: Record<string, string> = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return params;
  }

  /**
   * Notify all listeners of route change
   */
  private notifyListeners(
    match: RouteMatch | null,
    prevMatch: RouteMatch | null
  ): void {
    this.listeners.forEach((listener) => {
      listener(match, prevMatch);
    });
  }
}

// Singleton router instance
export const router = new RouterClass();

/**
 * Link click handler for SPA navigation
 */
export function handleLinkClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const link = target.closest('a');

  if (!link) return;

  const href = link.getAttribute('href');

  // Skip external links, anchors, and special links
  if (
    !href ||
    href.startsWith('http') ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    link.target === '_blank' ||
    event.metaKey ||
    event.ctrlKey
  ) {
    return;
  }

  event.preventDefault();
  router.navigate(href);
}

/**
 * Create a link element with SPA navigation
 */
export function createLink(
  href: string,
  content: string,
  className?: string
): string {
  return `<a href="${href}" class="${className || ''}" data-link>${content}</a>`;
}

/**
 * Initialize link click handling on container
 */
export function initializeLinks(container: HTMLElement): void {
  container.addEventListener('click', handleLinkClick);
}
