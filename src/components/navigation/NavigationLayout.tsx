import {
  createSignal,
  createEffect,
  onCleanup,
  type ParentComponent,
} from 'solid-js';
import { isServer } from 'solid-js/web';
import { Header } from '../Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { CommandPalette } from './CommandPalette';
import type { App } from '../../types';
import './NavigationLayout.css';

interface NavigationLayoutProps {
  apps: App[];
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
export const NavigationLayout: ParentComponent<NavigationLayoutProps> = (
  props
) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = createSignal(false);
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(true);
  const [isBottomNavOpen, setIsBottomNavOpen] = createSignal(true);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Toggle bottom nav
  const toggleBottomNav = () => {
    setIsBottomNavOpen((prev) => !prev);
  };

  // Open command palette
  const openCommandPalette = () => {
    setIsCommandPaletteOpen(true);
  };

  // Close command palette
  const closeCommandPalette = () => {
    setIsCommandPaletteOpen(false);
  };

  // Global keyboard shortcut for Cmd+K / Ctrl+K
  createEffect(() => {
    if (isServer || typeof document === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Also support "/" for quick search when not in an input
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  return (
    <div
      class={`navigation-layout${isSidebarOpen() ? '' : ' sidebar-collapsed'}`}
    >
      {/* Fixed Header */}
      <Header
        onSearchClick={openCommandPalette}
        onSidebarToggle={toggleSidebar}
        isSidebarOpen={isSidebarOpen()}
      />

      {/* Desktop Sidebar - CSS controls visibility */}
      <Sidebar apps={props.apps} isOpen={isSidebarOpen()} />

      {/* Main Content Wrapper */}
      <div class="navigation-content">
        <div class="content-wrapper">{props.children}</div>
      </div>

      {/* Mobile Bottom Navigation - CSS controls visibility */}
      <BottomNav onToggle={toggleBottomNav} isOpen={isBottomNavOpen()} />

      {/* Command Palette (Universal) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen()}
        onClose={closeCommandPalette}
        apps={props.apps}
      />
    </div>
  );
};
