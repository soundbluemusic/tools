<script lang="ts">
  import { theme, language, resolvedTheme } from '$lib/stores';

  interface Props {
    onSearchClick: () => void;
  }

  let { onSearchClick }: Props = $props();

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  const shortcut = isMac ? '⌘K' : 'Ctrl+K';

  function cycleTheme() {
    theme.cycle();
  }

  function toggleLanguage() {
    language.toggle();
  }
</script>

<header class="site-header">
  <div class="header-inner">
    <a href="/" class="header-logo">
      <span class="header-logo-text">Tools</span>
      <span class="header-logo-badge">Beta</span>
    </a>

    <button
      class="header-search"
      onclick={onSearchClick}
      aria-label="Search"
    >
      <svg class="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <span class="header-search-text">Search...</span>
      <span class="header-search-shortcut">{shortcut}</span>
    </button>

    <div class="header-controls">
      <button
        class="header-control-btn header-lang-btn"
        onclick={toggleLanguage}
        aria-label="Toggle language"
      >
        <svg class="header-icon header-icon-lang" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span class="header-lang-text">{$language.toUpperCase()}</span>
      </button>

      <button
        class="header-control-btn"
        onclick={cycleTheme}
        aria-label="Toggle theme"
      >
        {#if $resolvedTheme === 'dark'}
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        {:else}
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        {/if}
      </button>
    </div>
  </div>
</header>
