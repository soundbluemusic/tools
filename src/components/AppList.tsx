import { type Component, For } from 'solid-js';
import type { AppList as AppListType } from '../types';
import type { Language } from '../i18n/types';
import AppItem from './AppItem';

interface AppListProps {
  readonly apps: AppListType;
  readonly isPending?: boolean;
  readonly language: Language;
  readonly ariaLabel: string;
}

/**
 * AppList Component - Responsive Grid Layout
 * Tailwind Grid로 반응형 카드 그리드 구현
 */
const AppList: Component<AppListProps> = (props) => {
  return (
    <nav
      class={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5${props.isPending ? ' opacity-60 pointer-events-none' : ''}`}
      role="list"
      aria-label={props.ariaLabel}
      aria-busy={props.isPending}
    >
      <For each={props.apps}>
        {(app) => <AppItem app={app} language={props.language} />}
      </For>
    </nav>
  );
};

export default AppList;

export { AppList };
