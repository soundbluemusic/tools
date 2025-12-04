import { type JSX, type ParentComponent, Show } from 'solid-js';
import { isServer } from 'solid-js/web';
import { A } from '@solidjs/router';

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
  onClick?: (e: MouseEvent) => void;
}

/**
 * SSR-safe Link component
 * Uses regular <a> tag during SSR prerendering, <A> from router on client
 * This prevents "router primitives can only be used inside a Route" errors during prerendering
 */
export const Link: ParentComponent<LinkProps> = (props) => {
  // During SSR, use a regular anchor tag
  if (isServer) {
    return (
      <a
        href={props.href}
        class={props.class}
        title={props.title}
        aria-label={props['aria-label']}
        aria-current={props['aria-current']}
        onClick={props.onClick}
      >
        {props.children}
      </a>
    );
  }

  // On client, use the router's <A> component for SPA navigation
  return (
    <A
      href={props.href}
      class={props.class}
      activeClass={props.activeClass}
      inactiveClass={props.inactiveClass}
      title={props.title}
      aria-label={props['aria-label']}
      aria-current={props['aria-current']}
      onClick={props.onClick}
    >
      {props.children}
    </A>
  );
};
