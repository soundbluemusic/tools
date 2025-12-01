<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { apps, t, theme, language } from '$lib/stores';
  import Header from '$lib/components/navigation/Header.svelte';
  import Sidebar from '$lib/components/navigation/Sidebar.svelte';
  import BottomNav from '$lib/components/navigation/BottomNav.svelte';
  import CommandPalette from '$lib/components/navigation/CommandPalette.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkipLink from '$lib/components/SkipLink.svelte';

  let { children } = $props();

  let showCommandPalette = $state(false);

  function handleKeydown(event: KeyboardEvent) {
    // Cmd/Ctrl + K or /
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      showCommandPalette = true;
    } else if (event.key === '/' && !isInputFocused()) {
      event.preventDefault();
      showCommandPalette = true;
    } else if (event.key === 'Escape') {
      showCommandPalette = false;
    }
  }

  function isInputFocused(): boolean {
    const activeElement = document.activeElement;
    return (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement?.getAttribute('contenteditable') === 'true'
    );
  }

  function openCommandPalette() {
    showCommandPalette = true;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="navigation-layout">
  <SkipLink />
  <Header onSearchClick={openCommandPalette} />
  <Sidebar apps={$apps} currentPath={$page.url.pathname} />
  <BottomNav currentPath={$page.url.pathname} />

  <div class="navigation-content">
    <div class="content-wrapper">
      <main id="main-content" class="main-content" role="main">
        {@render children()}
      </main>
      <Footer />
    </div>
  </div>

  {#if showCommandPalette}
    <CommandPalette
      apps={$apps}
      onClose={() => (showCommandPalette = false)}
    />
  {/if}
</div>
