import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import type { App } from '../../types';

// SVG Icons
const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
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
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
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
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
);

interface QuickAction {
  id: string;
  labelKo: string;
  labelEn: string;
  icon: React.ReactNode;
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
export const CommandPalette = memo(function CommandPalette({
  isOpen,
  onClose,
  apps,
}: CommandPaletteProps) {
  const { language, localizedPath } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Quick actions
  const quickActions = useMemo<QuickAction[]>(
    () => [
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
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
        action: () => navigate(localizedPath('/')),
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
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
        action: () => navigate(localizedPath('/sitemap')),
        keywords: ['sitemap', 'all', '사이트맵', '전체'],
      },
    ],
    [navigate, localizedPath]
  );

  // Filter results based on query
  const filteredResults = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      // Show all apps and actions when empty
      return {
        apps: apps,
        actions: quickActions,
      };
    }

    const filteredApps = apps.filter((app) => {
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

    const filteredActions = quickActions.filter((action) => {
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
  }, [query, apps, quickActions]);

  // Total results count
  const totalResults =
    filteredResults.apps.length + filteredResults.actions.length;

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay to ensure modal is rendered
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Scroll selected item into view (instant to avoid jank during rapid keyboard navigation)
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-command-item]');
    const selectedItem = items[selectedIndex] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, totalResults - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          // Execute selected action
          if (selectedIndex < filteredResults.apps.length) {
            navigate(localizedPath(filteredResults.apps[selectedIndex].url));
            onClose();
          } else {
            const actionIndex = selectedIndex - filteredResults.apps.length;
            filteredResults.actions[actionIndex]?.action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [
      selectedIndex,
      totalResults,
      filteredResults,
      navigate,
      localizedPath,
      onClose,
    ]
  );

  // Handle item click - uses data-index attribute to avoid inline functions
  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const index = parseInt(e.currentTarget.dataset.index || '0', 10);
      if (index < filteredResults.apps.length) {
        navigate(localizedPath(filteredResults.apps[index].url));
      } else {
        const actionIndex = index - filteredResults.apps.length;
        filteredResults.actions[actionIndex]?.action();
      }
      onClose();
    },
    [filteredResults, navigate, localizedPath, onClose]
  );

  // Handle mouse enter - uses data-index attribute to avoid inline functions
  const handleItemMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const index = parseInt(e.currentTarget.dataset.index || '0', 10);
      setSelectedIndex(index);
    },
    []
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle query change - memoized to avoid recreation
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  const t = {
    placeholder:
      language === 'ko' ? '검색 또는 명령어...' : 'Search or type a command...',
    tools: language === 'ko' ? '도구' : 'Tools',
    actions: language === 'ko' ? '빠른 실행' : 'Quick Actions',
    noResults: language === 'ko' ? '검색 결과가 없습니다' : 'No results found',
    hint: language === 'ko' ? '이동하려면 Enter' : 'to navigate',
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-modal-backdrop flex items-start justify-center pt-[15vh] bg-bg-overlay backdrop-blur-sm animate-fadeIn max-[575px]:pt-4 motion-reduce:animate-none"
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div
        className="w-full max-w-command-palette h-command-palette mx-4 bg-bg-secondary border border-border-primary rounded-lg shadow-2xl flex flex-col overflow-hidden animate-slideDown max-[575px]:max-w-none max-[575px]:mx-3 max-[575px]:max-h-[calc(100vh-2rem-env(safe-area-inset-bottom))] motion-reduce:animate-none"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'ko' ? '명령 팔레트' : 'Command Palette'}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border-primary text-text-secondary">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 p-0 m-0 bg-transparent border-none outline-none text-text-primary text-base caret-text-primary placeholder:text-text-tertiary"
            placeholder={t.placeholder}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            aria-label={t.placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <kbd className="inline-flex items-center justify-center px-2 py-1 bg-bg-tertiary border border-border-primary rounded-sm text-text-tertiary font-mono text-xs">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-border-hover"
          ref={listRef}
        >
          {totalResults === 0 ? (
            <div className="flex items-center justify-center p-8 text-text-tertiary text-sm">
              <p>{t.noResults}</p>
            </div>
          ) : (
            <>
              {/* Apps */}
              {filteredResults.apps.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-text-tertiary text-xs font-semibold uppercase tracking-wide">
                    {t.tools}
                  </div>
                  {filteredResults.apps.map((app, index) => {
                    const isSelected = selectedIndex === index;
                    return (
                      <button
                        key={app.id}
                        data-command-item
                        data-index={index}
                        className={`flex items-center gap-3 w-full p-3 border-none rounded-md text-sm text-left cursor-pointer transition-colors duration-fast motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:-outline-offset-2 ${
                          isSelected
                            ? 'bg-interactive-active text-text-primary'
                            : 'bg-transparent text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
                        }`}
                        onClick={handleItemClick}
                        onMouseEnter={handleItemMouseEnter}
                      >
                        <span
                          className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-md text-lg leading-none ${
                            isSelected
                              ? 'bg-interactive-muted'
                              : 'bg-bg-tertiary'
                          }`}
                          aria-hidden="true"
                        >
                          {app.icon}
                        </span>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <span className="font-medium text-text-primary truncate">
                            {language === 'ko' ? app.name.ko : app.name.en}
                          </span>
                          <span className="text-xs text-text-tertiary truncate">
                            {language === 'ko' ? app.desc.ko : app.desc.en}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 text-text-tertiary transition-opacity duration-fast motion-reduce:transition-none ${
                            isSelected ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <ArrowRightIcon />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quick Actions */}
              {filteredResults.actions.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-text-tertiary text-xs font-semibold uppercase tracking-wide">
                    {t.actions}
                  </div>
                  {filteredResults.actions.map((action, index) => {
                    const itemIndex = filteredResults.apps.length + index;
                    const isSelected = selectedIndex === itemIndex;
                    return (
                      <button
                        key={action.id}
                        data-command-item
                        data-index={itemIndex}
                        className={`flex items-center gap-3 w-full p-3 border-none rounded-md text-sm text-left cursor-pointer transition-colors duration-fast motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:-outline-offset-2 ${
                          isSelected
                            ? 'bg-interactive-active text-text-primary'
                            : 'bg-transparent text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
                        }`}
                        onClick={handleItemClick}
                        onMouseEnter={handleItemMouseEnter}
                      >
                        <span
                          className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-md text-lg leading-none ${
                            isSelected
                              ? 'bg-interactive-muted'
                              : 'bg-bg-tertiary'
                          }`}
                          aria-hidden="true"
                        >
                          {action.icon}
                        </span>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <span className="font-medium text-text-primary truncate">
                            {language === 'ko'
                              ? action.labelKo
                              : action.labelEn}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 text-text-tertiary transition-opacity duration-fast motion-reduce:transition-none ${
                            isSelected ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <ArrowRightIcon />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-4 py-3 border-t border-border-primary bg-bg-tertiary max-[575px]:hidden">
          <div className="flex items-center gap-2 text-text-tertiary text-xs">
            <kbd className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 bg-bg-secondary border border-border-primary rounded-sm font-mono text-[10px] leading-tight">
              <EnterIcon />
            </kbd>
            <span>{t.hint}</span>
          </div>
          <div className="flex items-center gap-2 text-text-tertiary text-xs">
            <kbd className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 bg-bg-secondary border border-border-primary rounded-sm font-mono text-[10px] leading-tight">
              ↑
            </kbd>
            <kbd className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 bg-bg-secondary border border-border-primary rounded-sm font-mono text-[10px] leading-tight">
              ↓
            </kbd>
            <span>{language === 'ko' ? '탐색' : 'navigate'}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

CommandPalette.displayName = 'CommandPalette';
