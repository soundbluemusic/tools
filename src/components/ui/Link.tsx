import { type ParentComponent } from 'solid-js';
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
 * Hydration-safe Link component
 * Uses SolidJS Router's A component for proper SPA navigation
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
      onClick={props.onClick}
    >
      {props.children}
    </A>
  );
};
