import { type ParentComponent } from 'solid-js';
import { isServer } from 'solid-js/web';
import { useNavigate } from '@solidjs/router';

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
 * Always renders <a> tag for consistent SSR/client HTML
 * Uses client-side navigation via useNavigate for SPA behavior
 */
export const Link: ParentComponent<LinkProps> = (props) => {
  // Get navigate function only on client
  // This is safe because we only use it in the click handler
  const navigate = isServer ? null : useNavigate();

  const handleClick = (e: MouseEvent) => {
    // Call user's onClick if provided
    props.onClick?.(e);

    // Skip SPA navigation if:
    // - On server (no navigate function)
    // - Event was prevented by user's onClick
    // - Modifier keys held (for open in new tab, etc.)
    // - Target is external link
    if (
      !navigate ||
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }

    // Check if external link
    const href = props.href;
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//')
    ) {
      return; // Let browser handle external links
    }

    // Prevent default and use SPA navigation
    e.preventDefault();
    navigate(href);
  };

  // Always render <a> for consistent hydration
  return (
    <a
      href={props.href}
      class={props.class}
      title={props.title}
      aria-label={props['aria-label']}
      aria-current={props['aria-current']}
      onClick={handleClick}
    >
      {props.children}
    </a>
  );
};
