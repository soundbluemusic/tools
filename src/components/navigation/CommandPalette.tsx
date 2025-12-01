import {
  memo,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import type { App } from '../../types';
import './CommandPalette.css';

// SVG Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const EnterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Quick actions
  const quickActions = useMemo<QuickAction[]>(() => [
    {
      id: 'home',
      labelKo: '홈으로 이동',
      labelEn: 'Go to Home',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      action: () => navigate('/sitemap'),
      keywords: ['sitemap', 'all', '사이트맵', '전체'],
    },
  ], [navigate]);

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
  const totalResults = filteredResults.apps.length + filteredResults.actions.length;

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

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-command-item]');
    const selectedItem = items[selectedIndex] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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
          navigate(filteredResults.apps[selectedIndex].url);
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
  }, [selectedIndex, totalResults, filteredResults, navigate, onClose]);

  // Handle item click - uses data-index attribute to avoid inline functions
  const handleItemClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const index = parseInt(e.currentTarget.dataset.index || '0', 10);
    if (index < filteredResults.apps.length) {
      navigate(filteredResults.apps[index].url);
    } else {
      const actionIndex = index - filteredResults.apps.length;
      filteredResults.actions[actionIndex]?.action();
    }
    onClose();
  }, [filteredResults, navigate, onClose]);

  // Handle mouse enter - uses data-index attribute to avoid inline functions
  const handleItemMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const index = parseInt(e.currentTarget.dataset.index || '0', 10);
    setSelectedIndex(index);
  }, []);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle query change - memoized to avoid recreation
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const t = {
    placeholder: language === 'ko' ? '검색 또는 명령어...' : 'Search or type a command...',
    tools: language === 'ko' ? '도구' : 'Tools',
    actions: language === 'ko' ? '빠른 실행' : 'Quick Actions',
    noResults: language === 'ko' ? '검색 결과가 없습니다' : 'No results found',
    hint: language === 'ko' ? '이동하려면 Enter' : 'to navigate',
  };

  if (!isOpen) return null;

  return (
    <div
      className="command-palette-backdrop"
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'ko' ? '명령 팔레트' : 'Command Palette'}
      >
        {/* Search Input */}
        <div className="command-palette-header">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
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
          <kbd className="command-palette-esc">ESC</kbd>
        </div>

        {/* Results */}
        <div className="command-palette-results" ref={listRef}>
          {totalResults === 0 ? (
            <div className="command-palette-empty">
              <p>{t.noResults}</p>
            </div>
          ) : (
            <>
              {/* Apps */}
              {filteredResults.apps.length > 0 && (
                <div className="command-palette-section">
                  <div className="command-palette-section-label">{t.tools}</div>
                  {filteredResults.apps.map((app, index) => (
                    <button
                      key={app.id}
                      data-command-item
                      data-index={index}
                      className={`command-palette-item ${selectedIndex === index ? 'selected' : ''}`}
                      onClick={handleItemClick}
                      onMouseEnter={handleItemMouseEnter}
                    >
                      <span className="command-palette-item-icon" aria-hidden="true">
                        {app.icon}
                      </span>
                      <div className="command-palette-item-content">
                        <span className="command-palette-item-title">
                          {language === 'ko' ? app.name.ko : app.name.en}
                        </span>
                        <span className="command-palette-item-desc">
                          {language === 'ko' ? app.desc.ko : app.desc.en}
                        </span>
                      </div>
                      <ArrowRightIcon />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              {filteredResults.actions.length > 0 && (
                <div className="command-palette-section">
                  <div className="command-palette-section-label">{t.actions}</div>
                  {filteredResults.actions.map((action, index) => {
                    const itemIndex = filteredResults.apps.length + index;
                    return (
                      <button
                        key={action.id}
                        data-command-item
                        data-index={itemIndex}
                        className={`command-palette-item ${selectedIndex === itemIndex ? 'selected' : ''}`}
                        onClick={handleItemClick}
                        onMouseEnter={handleItemMouseEnter}
                      >
                        <span className="command-palette-item-icon" aria-hidden="true">
                          {action.icon}
                        </span>
                        <div className="command-palette-item-content">
                          <span className="command-palette-item-title">
                            {language === 'ko' ? action.labelKo : action.labelEn}
                          </span>
                        </div>
                        <ArrowRightIcon />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="command-palette-footer">
          <div className="command-palette-hint">
            <kbd><EnterIcon /></kbd>
            <span>{t.hint}</span>
          </div>
          <div className="command-palette-hint">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <span>{language === 'ko' ? '탐색' : 'navigate'}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

CommandPalette.displayName = 'CommandPalette';
