<script lang="ts">
  import PageLayout from '../../components/layout/PageLayout.svelte';
  import DrumMachine from '../../apps/drum/components/DrumMachine.svelte';
  import ShareButton from '../../components/ShareButton.svelte';
  import { t } from '../../stores';

  $: drum = $t.drum;

  $: breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '음악 도구', en: 'Music Tools' }, href: '/' },
    { label: { ko: drum.title, en: drum.title } },
  ];
</script>

<PageLayout
  title={drum.title}
  description={drum.description}
  {breadcrumb}
>
  <svelte:fragment slot="actions">
    <ShareButton title={drum.title} description={drum.description} />
  </svelte:fragment>

  <DrumMachine />
</PageLayout>
