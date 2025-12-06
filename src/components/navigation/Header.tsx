'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Search, PanelLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n';

interface HeaderProps {
  onSearchClick?: () => void;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({
  onSearchClick,
  onSidebarToggle,
  isSidebarOpen,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const isMac =
    typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
  const shortcutKey = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-4 px-4">
        {/* Left: Sidebar Toggle + Logo */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {onSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              aria-label={isSidebarOpen ? t.sidebar.close : t.sidebar.open}
              aria-expanded={isSidebarOpen}
              className="hidden md:flex"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}

          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold tracking-tight">
              {t.brand}
            </span>
          </Link>
        </div>

        {/* Center: Search Button */}
        <div className="hidden flex-1 justify-center md:flex">
          <Button
            variant="outline"
            onClick={onSearchClick}
            className="h-10 w-full max-w-md justify-start gap-4 rounded-full px-5 text-muted-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left text-sm">{t.search}</span>
            <kbd className="pointer-events-none hidden rounded border bg-muted px-2 py-0.5 text-xs font-medium sm:inline-block">
              {shortcutKey}
            </kbd>
          </Button>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-shrink-0 items-center gap-1">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            aria-label={t.searchShortcut}
            className="md:hidden"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? t.theme.light : t.theme.dark}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-1 px-2"
            aria-label={
              language === 'ko' ? 'Switch to English' : '한국어로 전환'
            }
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold">
              {language === 'ko' ? 'KO' : 'EN'}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
