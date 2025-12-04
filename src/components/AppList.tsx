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
 * CSS Grid로 반응형 카드 그리드 구현
 */
const AppList: Component<AppListProps> = (props) => {
  return (
    <nav
      class={`app-grid${props.isPending ? ' app-grid--pending' : ''}`}
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
