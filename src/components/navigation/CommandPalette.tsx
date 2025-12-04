import {
  type Component,
  type JSX,
  createSignal,
  createEffect,
  createMemo,
  Show,
  For,
  onCleanup,
} from 'solid-js';
import { useLanguage } from '../../i18n';
import { useLocalizedNavigate } from '../../hooks';
import type { App } from '../../types';
import './CommandPalette.css';

// SVG Icons
const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const EnterIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
);

interface QuickAction {
  id: string;
  labelKo: string;
  labelEn: string;
  icon: JSX.Element;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  apps: App[];
}

/**
 * Command Palette (Cmd+K)
 * Universal search and navigation for power users
 * Following patterns from Slack, Notion, Linear, Figma
 */
export const CommandPalette: Component<CommandPaletteProps> = (props) => {
  const { language } = useLanguage();
  const navigate = useLocalizedNavigate();
  const [query, setQuery] = createSignal('');
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  let inputRef: HTMLInputElement | undefined;
  let listRef: HTMLDivElement | undefined;

  // Quick actions
  const quickActions = createMemo<QuickAction[]>(() => [
    {
      id: 'home',
      labelKo: '홈으로 이동',
      labelEn: 'Go to Home',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      action: () => navigate('/'),
      keywords: ['home', 'main', '홈', '메인'],
    },
    {
      id: 'sitemap',
      labelKo: '사이트맵 보기',
      labelEn: 'View Sitemap',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      action: () => navigate('/sitemap'),
      keywords: ['sitemap', 'all', '사이트맵', '전체'],
    },
  ]);

  // Filter results based on query
  const filteredResults = createMemo(() => {
    const normalizedQuery = query().toLowerCase().trim();

    if (!normalizedQuery) {
      // Show all apps and actions when empty
      return {
        apps: props.apps,
        actions: quickActions(),
      };
    }

    const filteredApps = props.apps.filter((app) => {
      const nameKo = app.name.ko.toLowerCase();
      const nameEn = app.name.en.toLowerCase();
      const descKo = app.desc.ko.toLowerCase();
      const descEn = app.desc.en.toLowerCase();

      return (
        nameKo.includes(normalizedQuery) ||
        nameEn.includes(normalizedQuery) ||
        descKo.includes(normalizedQuery) ||
        descEn.includes(normalizedQuery)
      );
    });

    const filteredActions = quickActions().filter((action) => {
      const labelKo = action.labelKo.toLowerCase();
      const labelEn = action.labelEn.toLowerCase();
      const keywords = action.keywords.join(' ').toLowerCase();

      return (
        labelKo.includes(normalizedQuery) ||
        labelEn.includes(normalizedQuery) ||
        keywords.includes(normalizedQuery)
      );
    });

    return {
      apps: filteredApps,
      actions: filteredActions,
    };
  });

  // Total results count
  const totalResults = () =>
    filteredResults().apps.length + filteredResults().actions.length;

  // Reset selected index when query changes
  createEffect(() => {
    query(); // Track query changes
    setSelectedIndex(0);
  });

  // Focus input when opened
  createEffect(() => {
    if (props.isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay to ensure modal is rendered
      requestAnimationFrame(() => {
        inputRef?.focus();
      });
    }
  });

  // Scroll selected item into view (instant to avoid jank during rapid keyboard navigation)
  createEffect(() => {
    const index = selectedIndex();
    if (!listRef) return;
    const items = listRef.querySelectorAll('[data-command-item]');
    const selectedItem = items[index] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, totalResults() - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        // Execute selected action
        if (selectedIndex() < filteredResults().apps.length) {
          navigate(filteredResults().apps[selectedIndex()].url);
          props.onClose();
        } else {
          const actionIndex = selectedIndex() - filteredResults().apps.length;
          filteredResults().actions[actionIndex]?.action();
          props.onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        props.onClose();
        break;
    }
  };

  // Handle item click - uses data-index attribute to avoid inline functions
  const handleItemClick = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLButtonElement;
    const index = parseInt(target.dataset.index || '0', 10);
    if (index < filteredResults().apps.length) {
      navigate(filteredResults().apps[index].url);
    } else {
      const actionIndex = index - filteredResults().apps.length;
      filteredResults().actions[actionIndex]?.action();
    }
    props.onClose();
  };

  // Handle mouse enter - uses data-index attribute to avoid inline functions
  const handleItemMouseEnter = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLButtonElement;
    const index = parseInt(target.dataset.index || '0', 10);
    setSelectedIndex(index);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  // Handle query change
  const handleQueryChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setQuery(target.value);
  };

  const t = () => ({
    placeholder:
      language() === 'ko'
        ? '검색 또는 명령어...'
        : 'Search or type a command...',
    tools: language() === 'ko' ? '도구' : 'Tools',
    actions: language() === 'ko' ? '빠른 실행' : 'Quick Actions',
    noResults:
      language() === 'ko' ? '검색 결과가 없습니다' : 'No results found',
    hint: language() === 'ko' ? '이동하려면 Enter' : 'to navigate',
  });

  return (
    <Show when={props.isOpen}>
      <div
        class="command-palette-backdrop"
        onClick={handleBackdropClick}
        aria-hidden={!props.isOpen}
      >
        <div
          class="command-palette"
          role="dialog"
          aria-modal="true"
          aria-label={language() === 'ko' ? '명령 팔레트' : 'Command Palette'}
        >
          {/* Search Input */}
          <div class="command-palette-header">
            <SearchIcon />
            <input
              ref={inputRef}
              type="text"
              class="command-palette-input"
              placeholder={t().placeholder}
              value={query()}
              onInput={handleQueryChange}
              onKeyDown={handleKeyDown}
              aria-label={t().placeholder}
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck={false}
            />
            <kbd class="command-palette-esc">ESC</kbd>
          </div>

          {/* Results */}
          <div class="command-palette-results" ref={listRef}>
            <Show
              when={totalResults() > 0}
              fallback={
                <div class="command-palette-empty">
                  <p>{t().noResults}</p>
                </div>
              }
            >
              {/* Apps */}
              <Show when={filteredResults().apps.length > 0}>
                <div class="command-palette-section">
                  <div class="command-palette-section-label">{t().tools}</div>
                  <For each={filteredResults().apps}>
                    {(app, index) => (
                      <button
                        data-command-item
                        data-index={index()}
                        class={`command-palette-item ${selectedIndex() === index() ? 'selected' : ''}`}
                        onClick={handleItemClick}
                        onMouseEnter={handleItemMouseEnter}
                      >
                        <span
                          class="command-palette-item-icon"
                          aria-hidden="true"
                        >
                          {app.icon}
                        </span>
                        <div class="command-palette-item-content">
                          <span class="command-palette-item-title">
                            {language() === 'ko' ? app.name.ko : app.name.en}
                          </span>
                          <span class="command-palette-item-desc">
                            {language() === 'ko' ? app.desc.ko : app.desc.en}
                          </span>
                        </div>
                        <ArrowRightIcon />
                      </button>
                    )}
                  </For>
                </div>
              </Show>

              {/* Quick Actions */}
              <Show when={filteredResults().actions.length > 0}>
                <div class="command-palette-section">
                  <div class="command-palette-section-label">{t().actions}</div>
                  <For each={filteredResults().actions}>
                    {(action, index) => {
                      const itemIndex = () =>
                        filteredResults().apps.length + index();
                      return (
                        <button
                          data-command-item
                          data-index={itemIndex()}
                          class={`command-palette-item ${selectedIndex() === itemIndex() ? 'selected' : ''}`}
                          onClick={handleItemClick}
                          onMouseEnter={handleItemMouseEnter}
                        >
                          <span
                            class="command-palette-item-icon"
                            aria-hidden="true"
                          >
                            {action.icon}
                          </span>
                          <div class="command-palette-item-content">
                            <span class="command-palette-item-title">
                              {language() === 'ko'
                                ? action.labelKo
                                : action.labelEn}
                            </span>
                          </div>
                          <ArrowRightIcon />
                        </button>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </Show>
          </div>

          {/* Footer */}
          <div class="command-palette-footer">
            <div class="command-palette-hint">
              <kbd>
                <EnterIcon />
              </kbd>
              <span>{t().hint}</span>
            </div>
            <div class="command-palette-hint">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <span>{language() === 'ko' ? '탐색' : 'navigate'}</span>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};
