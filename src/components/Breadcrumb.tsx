import { type Component, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { useLanguage } from '../i18n';
import { useLocalizedPath } from '../hooks';
import './Breadcrumb.css';

interface BreadcrumbItem {
  label: { ko: string; en: string };
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb Navigation Component
 * Shows hierarchical navigation path (e.g., Home > Music Tools > Metronome)
 */
export const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  const { language } = useLanguage();
  const { toLocalizedPath } = useLocalizedPath();

  const getPath = (path: string) => toLocalizedPath(path);

  return (
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        <For each={props.items}>
          {(item, index) => {
            const isLast = () => index() === props.items.length - 1;
            const label = () => item.label[language()];

            return (
              <li class="breadcrumb-item">
                <Show
                  when={!isLast() && item.href}
                  fallback={
                    <span class="breadcrumb-current" aria-current="page">
                      {label()}
                    </span>
                  }
                >
                  <A href={getPath(item.href!)} class="breadcrumb-link">
                    <Show when={index() === 0}>
                      <svg
                        class="breadcrumb-home-icon"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                      >
                        <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
                      </svg>
                    </Show>
                    <span>{label()}</span>
                  </A>
                  <svg
                    class="breadcrumb-separator"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                  >
                    <path
                      stroke-width="2"
                      stroke-linecap="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Show>
              </li>
            );
          }}
        </For>
      </ol>
    </nav>
  );
};
