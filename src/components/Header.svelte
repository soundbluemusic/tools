<script lang="ts">
  import { link } from 'svelte-routing';
  import { language, toggleLanguage, theme, resolvedTheme, cycleTheme } from '../stores';
  import type { Theme } from '../stores';
  import ThemeIcon from './ui/ThemeIcon.svelte';
  import './Header.css';

  export let onSearchClick: (() => void) | undefined = undefined;

  function handleSearchClick() {
    onSearchClick?.();
  }

  // Detect OS for keyboard shortcut hint
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
  const shortcutKey = isMac ? '\u2318K' : 'Ctrl+K';

  const themeLabels: Record<Theme, { ko: string; en: string }> = {
    system: { ko: '시스템', en: 'System' },
    light: { ko: '라이트', en: 'Light' },
    dark: { ko: '다크', en: 'Dark' },
  };

  $: nextTheme = $theme === 'system' ? 'light' : $theme === 'light' ? 'dark' : 'system';
  $: nextLabel = themeLabels[nextTheme as Theme][$language];
  $: themeTitle = $language === 'ko'
    ? `${nextLabel} 모드로 전환`
    : `Switch to ${nextLabel} mode`;
</script>

<header class="site-header">
  <div class="header-inner">
    <!-- Logo -->
    <a href="/" use:link class="header-logo">
      <span class="header-logo-text">tools</span>
      <span class="header-logo-badge">beta</span>
    </a>

    <!-- Search Button -->
    <button
      class="header-search"
      on:click={handleSearchClick}
      aria-label={$language === 'ko' ? '검색 열기' : 'Open search'}
    >
      <svg
        class="header-search-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="18"
        height="18"
      >
        <circle cx="11" cy="11" r="7" stroke-width="2" />
        <path stroke-width="2" stroke-linecap="round" d="M21 21l-4.35-4.35" />
      </svg>
      <span class="header-search-text">
        {$language === 'ko' ? '검색...' : 'Search...'}
      </span>
      <span class="header-search-shortcut">{shortcutKey}</span>
    </button>

    <!-- Controls -->
    <div class="header-controls">
      <!-- Theme Toggle -->
      <button
        on:click={cycleTheme}
        class="header-control-btn"
        title={themeTitle}
        aria-label={themeTitle}
      >
        <ThemeIcon theme={$theme} resolved={$resolvedTheme} />
      </button>

      <!-- Language Toggle -->
      <button
        on:click={toggleLanguage}
        class="header-control-btn header-lang-btn"
        title={$language === 'ko' ? 'Switch to English' : '한국어로 전환'}
        aria-label={$language === 'ko' ? 'Switch to English' : '한국어로 전환'}
      >
        <svg
          class="header-icon header-icon-lang"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="18"
          height="18"
        >
          <circle cx="12" cy="12" r="10" stroke-width="2" />
          <path
            stroke-width="2"
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          />
        </svg>
        <span class="header-lang-text">{$language === 'ko' ? 'EN' : 'KO'}</span>
      </button>
    </div>
  </div>
</header>
