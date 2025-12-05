import { type Component, For, type JSX } from 'solid-js';
import type { AppList as AppListType } from '../types';
import type { Language } from '../i18n/types';
import AppCard from './AppCard';

interface AppGridProps {
  readonly apps: AppListType;
  readonly isPending?: boolean;
  readonly language: Language;
  readonly ariaLabel?: string;
  readonly columns?: 2 | 3 | 4 | 5;
  readonly variant?: 'default' | 'compact';
  readonly class?: string;
  readonly children?: JSX.Element;
}

/**
 * AppGrid Component
 * Memoized grid container for app cards
 * Responsive layout with configurable columns
 */
const AppGrid: Component<AppGridProps> = (props) => {
  const columnsClass = () => {
    switch (props.columns) {
      case 2:
        return 'sm:grid-cols-2';
      case 3:
        return 'sm:grid-cols-2 lg:grid-cols-3';
      case 5:
        return 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
      default:
        return 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const gapClass = () =>
    props.variant === 'compact'
      ? 'gap-3 sm:gap-4'
      : 'gap-5 sm:gap-6 lg:gap-7 xl:gap-8';

  return (
    <nav
      class={`grid grid-cols-1 ${columnsClass()} ${gapClass()}${props.isPending ? ' opacity-60 pointer-events-none' : ''} ${props.class ?? ''}`}
      role="list"
      aria-label={props.ariaLabel}
      aria-busy={props.isPending}
    >
      {props.children ?? (
        <For each={props.apps}>
          {(app) => (
            <AppCard
              app={app}
              language={props.language}
              variant={props.variant}
            />
          )}
        </For>
      )}
    </nav>
  );
};

export default AppGrid;

export { AppGrid };
