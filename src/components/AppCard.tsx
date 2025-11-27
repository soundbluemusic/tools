import { memo, useCallback } from 'react';
import type { App } from '../types';

interface AppCardProps {
  readonly app: App;
}

/**
 * AppCard Component - Memoized for optimal re-render prevention
 * Only re-renders when app prop reference changes
 */
const AppCard = memo<AppCardProps>(
  function AppCard({ app }) {
    // Prefetch on hover for faster navigation
    const handleMouseEnter = useCallback(() => {
      // Preload the route on hover
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
        className="app-card"
        onMouseEnter={handleMouseEnter}
        aria-label={`${app.name} - ${app.desc}`}
      >
        <span className="icon" role="img" aria-hidden="true">
          {app.icon}
        </span>
        <div className="app-info">
          <div className="name">{app.name}</div>
          <div className="desc">{app.desc}</div>
        </div>
      </a>
    );
  },
  // Custom comparison - only re-render if id changes
  (prevProps, nextProps) => prevProps.app.id === nextProps.app.id
);

AppCard.displayName = 'AppCard';

export default AppCard;
