import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { App } from '../types';

interface AppItemProps {
  readonly app: App;
}

const AppItem = memo<AppItemProps>(
  function AppItem({ app }) {
    return (
      <Link
        to={app.url}
        className="app-item"
        aria-label={`${app.name} - ${app.desc}`}
        role="listitem"
      >
        <span className="app-item-text">{app.name}</span>
      </Link>
    );
  },
  (prevProps, nextProps) => prevProps.app.id === nextProps.app.id
);

AppItem.displayName = 'AppItem';

export default AppItem;
