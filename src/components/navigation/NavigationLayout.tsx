import { memo, useState, useCallback, useEffect } from 'react';
import { Header } from '../Header';
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
 * - Fixed header with logo, search, and controls
 * - Desktop: Left sidebar (240px)
 * - Mobile/Tablet: Bottom navigation bar (56px + safe area)
 * - Universal: Command palette (Cmd+K)
 *
 * Note: Both sidebar and bottom nav are always rendered,
 * CSS handles visibility based on viewport size.
 * This prevents hydration mismatches and flickering.
 */
export const NavigationLayout = memo(function NavigationLayout({
  apps,
  children,
}: NavigationLayoutProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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
      {/* Fixed Header */}
      <Header onSearchClick={openCommandPalette} />

      {/* Desktop Sidebar - CSS controls visibility */}
      <Sidebar apps={apps} />

      {/* Main Content Wrapper */}
      <div className="navigation-content">
        <div className="content-wrapper">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation - CSS controls visibility */}
      <BottomNav />

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
