import { memo, useCallback } from 'react';
import type { App } from '../types';

interface AppItemProps {
  readonly app: App;
}

/**
 * AppItem Component - Clean list item style
 * Memoized for optimal re-render prevention
 */
const AppItem = memo<AppItemProps>(
  function AppItem({ app }) {
    // Prefetch on hover for faster navigation
    const handleMouseEnter = useCallback(() => {
      if ('connection' in navigator) {
        const conn = navigator.connection as { saveData?: boolean };
        if (!conn.saveData) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = app.url;
          document.head.appendChild(link);
        }
      }
    }, [app.url]);

    return (
      <a
        href={app.url}
        className="app-item"
        onMouseEnter={handleMouseEnter}
        aria-label={`${app.name} - ${app.desc}`}
        role="listitem"
      >
        <span className="app-item-text">{app.name}</span>
      </a>
    );
  },
  (prevProps, nextProps) => prevProps.app.id === nextProps.app.id
);

AppItem.displayName = 'AppItem';

export default AppItem;
