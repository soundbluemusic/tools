<script lang="ts">
  import { browser } from '$app/environment';
  import PageLayout from '$lib/components/layout/PageLayout.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { t } from '$lib/stores';

  $: drum = $t.drum;

  $: breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/' },
    { label: { ko: drum.title, en: drum.title } },
  ];
</script>

<svelte:head>
  <title>{drum.title} - Productivity Tools</title>
  <meta name="description" content={drum.description} />
</svelte:head>

<PageLayout
  title={drum.title}
  description={drum.description}
  {breadcrumb}
>
  <svelte:fragment slot="actions">
    <ShareButton title={drum.title} description={drum.description} />
  </svelte:fragment>

  {#if browser}
    {#await import('$lib/apps/drum/components/DrumMachine.svelte') then { default: DrumMachine }}
      <DrumMachine />
    {/await}
  {:else}
    <div class="page-loader">
      <div class="loader-spinner loader-spinner--md"></div>
    </div>
  {/if}
</PageLayout>
