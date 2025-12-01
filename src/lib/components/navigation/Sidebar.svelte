<script lang="ts">
  import type { App } from '$lib/types';
  import { language } from '$lib/stores';

  interface Props {
    apps: App[];
    currentPath: string;
  }

  let { apps, currentPath }: Props = $props();

  function getAppName(app: App): string {
    return $language === 'ko' ? app.name.ko : app.name.en;
  }
</script>

<aside class="sidebar">
  <nav class="sidebar-nav">
    <a
      href="/"
      class="sidebar-item"
      class:active={currentPath === '/'}
    >
      <span class="sidebar-emoji">🏠</span>
      <span class="sidebar-label">{$language === 'ko' ? '홈' : 'Home'}</span>
    </a>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section-title">
      {$language === 'ko' ? '도구' : 'Tools'}
    </div>

    {#each apps as app (app.id)}
      <a
        href={app.url}
        class="sidebar-item"
        class:active={currentPath === app.url}
      >
        <span class="sidebar-emoji">{app.icon}</span>
        <span class="sidebar-label">{getAppName(app)}</span>
      </a>
    {/each}
  </nav>
</aside>
