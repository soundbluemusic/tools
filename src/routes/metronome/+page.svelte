<script lang="ts">
  import PageLayout from '../../components/layout/PageLayout.svelte';
  import MetronomePlayer from '../../apps/metronome/components/MetronomePlayer.svelte';
  import ShareButton from '../../components/ShareButton.svelte';
  import { t } from '../../stores';

  $: metronome = $t.metronome;

  $: breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/' },
    { label: { ko: metronome.title, en: metronome.title } },
  ];
</script>

<PageLayout
  title={metronome.title}
  description={metronome.description}
  {breadcrumb}
>
  <svelte:fragment slot="actions">
    <ShareButton title={metronome.title} description={metronome.description} />
  </svelte:fragment>

  <MetronomePlayer />
</PageLayout>
