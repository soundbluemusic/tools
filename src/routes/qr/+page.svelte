<script lang="ts">
  import { browser } from '$app/environment';
  import PageLayout from '$lib/components/layout/PageLayout.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { t } from '$lib/stores';

  $: qr = $t.qr;

  $: breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '기타 도구', en: 'Other Tools' }, href: '/' },
    { label: { ko: qr.title, en: qr.title } },
  ];
</script>

<svelte:head>
  <title>{qr.title} - Productivity Tools</title>
  <meta name="description" content={qr.subtitle} />
</svelte:head>

<PageLayout
  title={qr.title}
  description={qr.subtitle}
  {breadcrumb}
>
  <svelte:fragment slot="actions">
    <ShareButton title={qr.title} description={qr.subtitle} />
  </svelte:fragment>

  {#if browser}
    {#await import('$lib/apps/qr/components/QRGenerator.svelte') then { default: QRGenerator }}
      <QRGenerator />
    {/await}
  {:else}
    <div class="page-loader">
      <div class="loader-spinner loader-spinner--md"></div>
    </div>
  {/if}
</PageLayout>
