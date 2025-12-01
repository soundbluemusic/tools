<script lang="ts">
  import { link, useLocation } from 'svelte-routing';
  import { language } from '../../stores';
  import { MUSIC_APP_PATHS } from '../../constants/apps';
  import './BottomNav.css';

  const location = useLocation();

  function isActive(path: string): boolean {
    if (path === '/') return $location.pathname === '/';
    return $location.pathname.startsWith(path);
  }

  $: isMusicActive = MUSIC_APP_PATHS.some(p => $location.pathname.startsWith(p));
</script>

<nav class="bottom-nav">
  <!-- Home -->
  <a href="/" use:link class="bottom-nav-item" class:active={isActive('/')}>
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      {#if isActive('/')}
        <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
      {:else}
        <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm2-2h2v-6h8v6h2V11l-6-5.25L6 11v8z" />
      {/if}
    </svg>
    <span class="bottom-nav-label">{$language === 'ko' ? '홈' : 'Home'}</span>
  </a>

  <!-- Music Tools -->
  <a href="/metronome" use:link class="bottom-nav-item" class:active={isMusicActive}>
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      {#if isMusicActive}
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      {:else}
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm0 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
      {/if}
    </svg>
    <span class="bottom-nav-label">{$language === 'ko' ? '음악' : 'Music'}</span>
  </a>

  <!-- QR Code -->
  <a href="/qr" use:link class="bottom-nav-item" class:active={isActive('/qr')}>
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 2h-2v2h2v2h-4v-4h2v-2h-2v-2h4v4zm0 4h2v-2h-2v2zm-4-4h2v-2h-2v2z" />
    </svg>
    <span class="bottom-nav-label">QR</span>
  </a>

  <!-- More / Menu -->
  <a href="/sitemap" use:link class="bottom-nav-item" class:active={isActive('/sitemap')}>
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
    <span class="bottom-nav-label">{$language === 'ko' ? '메뉴' : 'Menu'}</span>
  </a>
</nav>
