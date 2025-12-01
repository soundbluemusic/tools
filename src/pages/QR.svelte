<script lang="ts">
  import PageLayout from '../components/layout/PageLayout.svelte';
  import QRGenerator from '../apps/qr/components/QRGenerator.svelte';
  import ShareButton from '../components/ShareButton.svelte';
  import { t } from '../stores';

  $: qr = $t.qr;

  $: breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: '기타 도구', en: 'Other Tools' }, href: '/' },
    { label: { ko: qr.title, en: qr.title } },
  ];
</script>

<PageLayout
  title={qr.title}
  description={qr.subtitle}
  {breadcrumb}
>
  <svelte:fragment slot="actions">
    <ShareButton title={qr.title} description={qr.subtitle} />
  </svelte:fragment>

  <QRGenerator />
</PageLayout>
