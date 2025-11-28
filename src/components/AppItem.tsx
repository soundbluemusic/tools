import { memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { App } from '../types';

interface AppItemProps {
  readonly app: App;
}

/**
 * AppItem Component - Single app list item
 * - GPU accelerated hover via CSS
 * - View Transitions API support for smooth navigation
 */
const AppItem = memo<AppItemProps>(
  function AppItem({ app }) {
    const navigate = useNavigate();

    // Handle click with View Transitions API
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Use View Transitions API if available
        if (document.startViewTransition) {
          e.preventDefault();
          document.startViewTransition(() => {
            navigate(app.url);
          });
        }
        // Otherwise, let the Link handle navigation normally
      },
      [navigate, app.url]
    );

    return (
      <Link
        to={app.url}
        className="app-item"
        aria-label={`${app.name} - ${app.desc}`}
        role="listitem"
        onClick={handleClick}
      >
        <span className="app-item-text">{app.name}</span>
      </Link>
    );
  },
  // Only re-render if app.id changes
  (prevProps, nextProps) => prevProps.app.id === nextProps.app.id
);

AppItem.displayName = 'AppItem';

export default AppItem;
