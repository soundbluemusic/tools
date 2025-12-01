<script lang="ts">
  import { browser } from '$app/environment';
  import PageLayout from '$lib/components/layout/PageLayout.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { t } from '$lib/stores';

  $: metronome = $t.metronome;

  $: breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/' },
    { label: { ko: metronome.title, en: metronome.title } },
  ];
</script>

<svelte:head>
  <title>{metronome.title} - Productivity Tools</title>
  <meta name="description" content={metronome.description} />
</svelte:head>

<PageLayout
  title={metronome.title}
  description={metronome.description}
  {breadcrumb}
>
  <svelte:fragment slot="actions">
    <ShareButton title={metronome.title} description={metronome.description} />
  </svelte:fragment>

  {#if browser}
    {#await import('$lib/apps/metronome/components/MetronomePlayer.svelte') then { default: MetronomePlayer }}
      <MetronomePlayer />
    {/await}
  {:else}
    <div class="page-loader">
      <div class="loader-spinner loader-spinner--md"></div>
    </div>
  {/if}
</PageLayout>
