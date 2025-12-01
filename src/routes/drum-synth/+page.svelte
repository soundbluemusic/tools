<script lang="ts">
  import PageLayout from '../../components/layout/PageLayout.svelte';
  import DrumSynthComponent from '../../apps/drum-synth/components/DrumSynth.svelte';
  import ShareButton from '../../components/ShareButton.svelte';
  import { t } from '../../stores';

  $: drumSynth = $t.drumSynth;

  $: breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/' },
    { label: { ko: drumSynth.title, en: drumSynth.title } },
  ];
</script>

<PageLayout
  title={drumSynth.title}
  description={drumSynth.description}
  {breadcrumb}
>
  <svelte:fragment slot="actions">
    <ShareButton title={drumSynth.title} description={drumSynth.description} />
  </svelte:fragment>

  <DrumSynthComponent />
</PageLayout>
