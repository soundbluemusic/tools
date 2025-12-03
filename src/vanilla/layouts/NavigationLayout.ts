/**
 * Navigation Layout - Vanilla TypeScript
 * Provides responsive navigation structure:
 * - Fixed header with logo, search, and controls
 * - Desktop: Left sidebar (240px)
 * - Mobile: Bottom navigation bar
 */
import { Component, html } from '../../core';
import { router } from '../../core/Router';
import { Header, Sidebar, BottomNav } from '../components';
import type { SidebarApp } from '../components';

export interface NavigationLayoutProps {
  [key: string]: unknown;
  apps?: SidebarApp[];
}

interface NavigationLayoutState {
  isSidebarOpen: boolean;
  isBottomNavOpen: boolean;
}

export class NavigationLayout extends Component<
  NavigationLayoutProps,
  NavigationLayoutState
> {
  private headerComponent: Header | null = null;
  private sidebarComponent: Sidebar | null = null;
  private bottomNavComponent: BottomNav | null = null;

  protected getInitialState(): NavigationLayoutState {
    return {
      isSidebarOpen: true,
      isBottomNavOpen: true,
    };
  }

  protected render(): string {
    const { isSidebarOpen } = this.state;

    return html`
      <div class="relative w-full min-h-screen bg-bg-primary text-text-primary">
        <!-- Header Container -->
        <div id="header-container"></div>

        <!-- Sidebar Container -->
        <div id="sidebar-container"></div>

        <!-- Main Content Wrapper -->
        <div
          class="w-full min-h-screen pt-14 ${isSidebarOpen
            ? 'lg:pl-sidebar'
            : 'lg:pl-0'}"
          style="padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));"
        >
          <div id="app-content" class="w-full min-h-[calc(100vh-56px)]">
            <!-- Content will be rendered here by router -->
          </div>
        </div>

        <!-- Bottom Nav Container -->
        <div id="bottom-nav-container"></div>

        <!-- Footer -->
        <footer
          class="border-t border-border-primary py-8 px-4 ${isSidebarOpen
            ? 'lg:pl-sidebar'
            : ''}"
        >
          <div
            class="max-w-container-xl mx-auto text-center text-sm text-text-tertiary"
          >
            <p>© ${new Date().getFullYear()} Tools. Open Source.</p>
            <div class="mt-2 flex justify-center gap-4">
              <a href="/privacy" class="hover:text-text-primary" data-link
                >Privacy</a
              >
              <a href="/terms" class="hover:text-text-primary" data-link
                >Terms</a
              >
              <a href="/opensource" class="hover:text-text-primary" data-link
                >Open Source</a
              >
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  protected onMount(): void {
    // Mount Header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      this.headerComponent = new Header({
        isSidebarOpen: this.state.isSidebarOpen,
        onSidebarToggle: () => this.toggleSidebar(),
        onSearchClick: () => this.openCommandPalette(),
      });
      this.headerComponent.mount(headerContainer);
    }

    // Mount Sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
      this.sidebarComponent = new Sidebar({
        apps: this.props.apps || [],
        isOpen: this.state.isSidebarOpen,
      });
      this.sidebarComponent.mount(sidebarContainer);
    }

    // Mount Bottom Nav
    const bottomNavContainer = document.getElementById('bottom-nav-container');
    if (bottomNavContainer) {
      this.bottomNavComponent = new BottomNav({
        isOpen: this.state.isBottomNavOpen,
        onToggle: () => this.toggleBottomNav(),
      });
      this.bottomNavComponent.mount(bottomNavContainer);
    }

    // Global keyboard shortcut for Cmd+K / Ctrl+K
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // SPA navigation for footer links
    this.addEventListener(this.element!, 'click', (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-link]') as HTMLAnchorElement;
      if (link) {
        e.preventDefault();
        router.navigate(link.pathname);
      }
    });
  }

  protected onDestroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));

    if (this.headerComponent) {
      this.headerComponent.unmount();
    }
    if (this.sidebarComponent) {
      this.sidebarComponent.unmount();
    }
    if (this.bottomNavComponent) {
      this.bottomNavComponent.unmount();
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.openCommandPalette();
    }

    // Also support "/" for quick search when not in an input
    if (
      e.key === '/' &&
      !['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (e.target as HTMLElement).tagName
      )
    ) {
      e.preventDefault();
      this.openCommandPalette();
    }
  }

  private toggleSidebar(): void {
    const newState = !this.state.isSidebarOpen;
    this.setState({ isSidebarOpen: newState });

    // Update child components
    if (this.headerComponent) {
      this.headerComponent.setProps({ isSidebarOpen: newState });
    }
    if (this.sidebarComponent) {
      this.sidebarComponent.setProps({ isOpen: newState });
    }
  }

  private toggleBottomNav(): void {
    const newState = !this.state.isBottomNavOpen;
    this.setState({ isBottomNavOpen: newState });

    if (this.bottomNavComponent) {
      this.bottomNavComponent.setProps({ isOpen: newState });
    }
  }

  private openCommandPalette(): void {
    // TODO: Implement command palette
    console.log('[Vanilla] Command palette not yet implemented');
  }

  /**
   * Update apps in sidebar
   */
  setApps(apps: SidebarApp[]): void {
    if (this.sidebarComponent) {
      this.sidebarComponent.setProps({ apps });
    }
  }
}
