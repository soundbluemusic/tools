import { memo, useState, useCallback, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { CommandPalette } from './CommandPalette';
import type { App } from '../../types';
import './NavigationLayout.css';

interface NavigationLayoutProps {
  apps: App[];
  children: React.ReactNode;
}

/**
 * Navigation Layout Wrapper
 * Provides responsive navigation structure:
 * - Desktop: Left sidebar (240px, collapsible to 72px)
 * - Mobile/Tablet: Bottom navigation bar (56px + safe area)
 * - Universal: Command palette (Cmd+K)
 */
export const NavigationLayout = memo(function NavigationLayout({
  apps,
  children,
}: NavigationLayoutProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Open command palette
  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  // Close command palette
  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  // Global keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Also support "/" for quick search when not in an input
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="navigation-layout">
      {/* Desktop Sidebar */}
      {isDesktop && (
        <Sidebar apps={apps} onSearchClick={openCommandPalette} />
      )}

      {/* Main Content */}
      <div className="navigation-content">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      {!isDesktop && (
        <BottomNav onSearchClick={openCommandPalette} />
      )}

      {/* Command Palette (Universal) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        apps={apps}
      />
    </div>
  );
});

NavigationLayout.displayName = 'NavigationLayout';
