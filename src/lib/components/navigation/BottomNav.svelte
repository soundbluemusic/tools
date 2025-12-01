<script lang="ts">
  import { language } from '$lib/stores';

  interface Props {
    currentPath: string;
  }

  let { currentPath }: Props = $props();

  const navItems = [
    { path: '/', icon: 'home', labelKo: '홈', labelEn: 'Home' },
    { path: '/metronome', icon: 'music', labelKo: '메트로놈', labelEn: 'Metronome' },
    { path: '/drum', icon: 'drum', labelKo: '드럼', labelEn: 'Drum' },
    { path: '/qr', icon: 'qr', labelKo: 'QR', labelEn: 'QR' }
  ];

  function getLabel(item: typeof navItems[0]): string {
    return $language === 'ko' ? item.labelKo : item.labelEn;
  }
</script>

<nav class="bottom-nav">
  {#each navItems as item (item.path)}
    <a
      href={item.path}
      class="bottom-nav-item"
      class:active={currentPath === item.path}
    >
      <span class="bottom-nav-icon">
        {#if item.icon === 'home'}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        {:else if item.icon === 'music'}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        {:else if item.icon === 'drum'}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
          </svg>
        {:else if item.icon === 'qr'}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        {/if}
      </span>
      <span class="bottom-nav-label">{getLabel(item)}</span>
    </a>
  {/each}
</nav>
