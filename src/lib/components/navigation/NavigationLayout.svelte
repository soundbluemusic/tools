<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '../Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import BottomNav from './BottomNav.svelte';
  import CommandPalette from './CommandPalette.svelte';
  import type { App } from '../../types';
  import './NavigationLayout.css';

  export let apps: App[] = [];

  let isCommandPaletteOpen = false;

  function openCommandPalette() {
    isCommandPaletteOpen = true;
  }

  function closeCommandPalette() {
    isCommandPaletteOpen = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isCommandPaletteOpen = !isCommandPaletteOpen;
    }

    // Also support "/" for quick search when not in an input
    if (
      e.key === '/' &&
      !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
    ) {
      e.preventDefault();
      isCommandPaletteOpen = true;
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });
</script>

<div class="navigation-layout">
  <!-- Fixed Header -->
  <Header onSearchClick={openCommandPalette} />

  <!-- Desktop Sidebar - CSS controls visibility -->
  <Sidebar {apps} />

  <!-- Main Content Wrapper -->
  <div class="navigation-content">
    <div class="content-wrapper">
      <slot />
    </div>
  </div>

  <!-- Mobile Bottom Navigation - CSS controls visibility -->
  <BottomNav />

  <!-- Command Palette (Universal) -->
  <CommandPalette
    isOpen={isCommandPaletteOpen}
    onClose={closeCommandPalette}
    {apps}
  />
</div>
