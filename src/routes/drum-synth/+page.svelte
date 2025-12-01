<script lang="ts">
  import { browser } from '$app/environment';
  import PageLayout from '$lib/components/layout/PageLayout.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { t } from '$lib/stores';

  $: drumSynth = $t.drumSynth;

  $: breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/' },
    { label: { ko: drumSynth.title, en: drumSynth.title } },
  ];
</script>

<svelte:head>
  <title>{drumSynth.title} - Productivity Tools</title>
  <meta name="description" content={drumSynth.description} />
</svelte:head>

<PageLayout
  title={drumSynth.title}
  description={drumSynth.description}
  {breadcrumb}
>
  <svelte:fragment slot="actions">
    <ShareButton title={drumSynth.title} description={drumSynth.description} />
  </svelte:fragment>

  {#if browser}
    {#await import('$lib/apps/drum-synth/components/DrumSynth.svelte') then { default: DrumSynthComponent }}
      <DrumSynthComponent />
    {/await}
  {:else}
    <div class="page-loader">
      <div class="loader-spinner loader-spinner--md"></div>
    </div>
  {/if}
</PageLayout>
