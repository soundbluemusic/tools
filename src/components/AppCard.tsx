import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { App } from '../types';

interface AppCardProps {
  readonly app: App;
}

const AppCard = memo<AppCardProps>(
  function AppCard({ app }) {
    return (
      <Link
        to={app.url}
        className="app-card"
        aria-label={`${app.name} - ${app.desc}`}
      >
        <span className="icon" role="img" aria-hidden="true">
          {app.icon}
        </span>
        <div className="app-info">
          <div className="name">{app.name}</div>
          <div className="desc">{app.desc}</div>
        </div>
      </Link>
    );
  },
  (prevProps, nextProps) => prevProps.app.id === nextProps.app.id
);

AppCard.displayName = 'AppCard';

export default AppCard;
