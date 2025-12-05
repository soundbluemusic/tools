import { type ParentComponent } from 'solid-js';
import { A } from '@solidjs/router';
import { preloadComponent } from '../../utils/preload';

interface LinkProps {
  href: string;
  class?: string;
  activeClass?: string;
  inactiveClass?: string;
  title?: string;
  'aria-label'?: string;
  'aria-current'?:
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | 'true'
    | 'false';
  role?: string;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onTouchStart?: (e: TouchEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  /** Enable prefetching on hover/focus (default: true for tool pages) */
  prefetch?: boolean;
}

/**
 * Get the base path for prefetching (strip locale prefix)
 */
function getBasePath(href: string): string {
  // Remove /ko prefix if present
  if (href.startsWith('/ko/')) {
    return href.slice(3);
  }
  if (href === '/ko') {
    return '/';
  }
  return href;
}

/**
 * Check if the path is a tool page that can be prefetched
 */
function isToolPage(href: string): boolean {
  const basePath = getBasePath(href);
  return ['/metronome', '/drum', '/drum-synth', '/drum-tool', '/qr'].includes(
    basePath
  );
}

/**
 * Hydration-safe Link component
 * Uses SolidJS Router's A component for proper SPA navigation
 *
 * Features:
 * - Automatic prefetching on hover/focus for tool pages
 * - Supports View Transitions API
 * - External links open in new tab
 */
export const Link: ParentComponent<LinkProps> = (props) => {
  // Check if external link
  const isExternal = () => {
    const href = props.href;
    return (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//')
    );
  };

  // Determine if prefetching should be enabled
  const shouldPrefetch = () => {
    if (props.prefetch === false) return false;
    if (props.prefetch === true) return true;
    // Auto-enable prefetching for tool pages
    return isToolPage(props.href);
  };

  // Prefetch handler - triggers on hover/focus
  const triggerPrefetch = () => {
    if (shouldPrefetch()) {
      const basePath = getBasePath(props.href);
      preloadComponent(basePath);
    }
  };

  // Combined event handlers
  const handleMouseEnter = (e: MouseEvent) => {
    triggerPrefetch();
    props.onMouseEnter?.(e);
  };

  const handleTouchStart = (e: TouchEvent) => {
    triggerPrefetch();
    props.onTouchStart?.(e);
  };

  const handleFocus = (e: FocusEvent) => {
    triggerPrefetch();
    props.onFocus?.(e);
  };

  // For external links, use regular <a> tag
  if (isExternal()) {
    return (
      <a
        href={props.href}
        class={props.class}
        title={props.title}
        aria-label={props['aria-label']}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.children}
      </a>
    );
  }

  // For internal links, use SolidJS Router's A component
  return (
    <A
      href={props.href}
      class={props.class}
      activeClass={props.activeClass}
      inactiveClass={props.inactiveClass}
      title={props.title}
      aria-label={props['aria-label']}
      aria-current={props['aria-current']}
      role={props.role}
      onClick={props.onClick}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onFocus={handleFocus}
    >
      {props.children}
    </A>
  );
};
