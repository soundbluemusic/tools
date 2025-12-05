import {
  createSignal,
  createEffect,
  onCleanup,
  lazy,
  Show,
  Suspense,
  type ParentComponent,
} from 'solid-js';
import { isServer } from 'solid-js/web';
import { Header } from '../Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import type { App } from '../../types';

// Lazy load CommandPalette - only loads when user opens it (Cmd+K)
const CommandPalette = lazy(() =>
  import('./CommandPalette').then((m) => ({ default: m.CommandPalette }))
);

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
 *
 * Tailwind CSS with GPU-accelerated animations
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
    <div class="relative w-full min-h-screen min-h-dvh overflow-x-hidden">
      {/* Fixed Header */}
      <Header
        onSearchClick={openCommandPalette}
        onSidebarToggle={toggleSidebar}
        isSidebarOpen={isSidebarOpen()}
      />

      {/* Desktop Sidebar - CSS controls visibility */}
      <Sidebar apps={props.apps} isOpen={isSidebarOpen()} />

      {/* Main Content Wrapper - margin-left animation based on sidebar state */}
      <div
        class={`
          relative w-auto min-h-screen min-h-dvh box-border
          mt-14 ml-0 mr-0
          will-change-[margin-left]
          transition-[margin-left] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          max-[767px]:ml-0 max-[767px]:pb-[calc(56px+env(safe-area-inset-bottom,0px))]
          max-[480px]:mt-[52px]
          supports-[padding-top:env(safe-area-inset-top)]:mt-[calc(56px+env(safe-area-inset-top))]
          supports-[padding-top:env(safe-area-inset-top)]:max-[480px]:mt-[calc(52px+env(safe-area-inset-top))]
          ${isSidebarOpen() ? 'md:ml-60' : ''}
        `}
      >
        <div
          class="
            w-full max-w-full box-border
            min-h-[calc(100vh-56px)] min-h-[calc(100dvh-56px)]
            max-[767px]:min-h-[calc(100vh-56px-56px)] max-[767px]:min-h-[calc(100dvh-56px-56px)]
            max-[480px]:min-h-[calc(100vh-52px)] max-[480px]:min-h-[calc(100dvh-52px)]
          "
        >
          {props.children}
        </div>
      </div>

      {/* Mobile Bottom Navigation - CSS controls visibility */}
      <BottomNav onToggle={toggleBottomNav} isOpen={isBottomNavOpen()} />

      {/* Command Palette - Lazy loaded, only mounts when opened */}
      <Show when={isCommandPaletteOpen()}>
        <Suspense>
          <CommandPalette
            isOpen={true}
            onClose={closeCommandPalette}
            apps={props.apps}
          />
        </Suspense>
      </Show>
    </div>
  );
};
