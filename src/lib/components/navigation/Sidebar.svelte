<script lang="ts">
  import { page } from '$app/stores';
  import { language } from '../../stores';
  import { MUSIC_APP_PATHS } from '../../constants/apps';
  import type { App } from '../../types';
  import './Sidebar.css';

  export let apps: App[] = [];

  function isActive(path: string): boolean {
    if (path === '/') return $page.url.pathname === '/';
    return $page.url.pathname.startsWith(path);
  }

  $: musicApps = apps.filter(app => (MUSIC_APP_PATHS as readonly string[]).includes(app.url));
  $: otherApps = apps.filter(app => !(MUSIC_APP_PATHS as readonly string[]).includes(app.url));
</script>

<aside class="sidebar">
  <nav class="sidebar-nav">
    <!-- Home -->
    <a href="/" class="sidebar-item" class:active={isActive('/')}>
      <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
        {#if isActive('/')}
          <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
        {:else}
          <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm2-2h2v-6h8v6h2V11l-6-5.25L6 11v8z" />
        {/if}
      </svg>
      <span class="sidebar-label">{$language === 'ko' ? '홈' : 'Home'}</span>
    </a>

    <div class="sidebar-divider"></div>

    <!-- Music Section -->
    <div class="sidebar-section-title">
      {$language === 'ko' ? '음악 도구' : 'Music Tools'}
    </div>

    {#each musicApps as app}
      <a href={app.url} class="sidebar-item" class:active={isActive(app.url)}>
        <span class="sidebar-icon sidebar-emoji">{app.icon}</span>
        <span class="sidebar-label">
          {$language === 'ko' ? app.name.ko : app.name.en}
        </span>
      </a>
    {/each}

    <div class="sidebar-divider"></div>

    <!-- Other Tools -->
    <div class="sidebar-section-title">
      {$language === 'ko' ? '기타 도구' : 'Other Tools'}
    </div>

    {#each otherApps as app}
      <a href={app.url} class="sidebar-item" class:active={isActive(app.url)}>
        <span class="sidebar-icon sidebar-emoji">{app.icon}</span>
        <span class="sidebar-label">
          {$language === 'ko' ? app.name.ko : app.name.en}
        </span>
      </a>
    {/each}

    <div class="sidebar-divider"></div>

    <!-- Menu / Settings -->
    <a href="/sitemap" class="sidebar-item" class:active={isActive('/sitemap')}>
      <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
      </svg>
      <span class="sidebar-label">{$language === 'ko' ? '메뉴' : 'Menu'}</span>
    </a>
  </nav>
</aside>
