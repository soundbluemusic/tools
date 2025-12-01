<script lang="ts">
  import { link } from 'svelte-routing';
  import type { App } from '../types';
  import type { Language } from '../i18n/types';

  export let app: App;
  export let language: Language;

  $: name = app.name[language];
  $: desc = app.desc[language];
</script>

<a
  href={app.url}
  use:link
  class="app-item"
  aria-label="{name} - {desc}"
>
  <span class="app-item-text">{name}</span>
</a>
