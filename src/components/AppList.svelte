<script lang="ts">
  import type { App } from '../types';
  import type { Language } from '../i18n/types';
  import AppItem from './AppItem.svelte';

  export let apps: readonly App[] = [];
  export let isPending: boolean = false;
  export let language: Language;
  export let ariaLabel: string;
</script>

<nav
  class="app-list"
  class:pending={isPending}
  role="list"
  aria-label={ariaLabel}
  aria-busy={isPending}
>
  {#each apps as app (app.id)}
    <AppItem {app} {language} />
  {/each}
</nav>
