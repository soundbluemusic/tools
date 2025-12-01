<script lang="ts">
  /**
   * @fileoverview Root Layout Component
   *
   * ARCHITECTURE: Frontend-Only (No Backend)
   * - This is a 100% client-side application with NO backend server
   * - All data is stored locally via localStorage
   * - PWA with Service Worker enables full offline functionality
   * - No API calls, no server authentication, no external data fetching
   */
  import { onMount } from 'svelte';
  import { initTheme, initApps, apps, isLoading } from '../stores';
  import NavigationLayout from '../components/navigation/NavigationLayout.svelte';
  import SkipLink from '../components/SkipLink.svelte';
  import Footer from '../components/Footer.svelte';
  import Loader from '../components/ui/Loader.svelte';
  import '../styles/index.css';
  import '../App.css';

  // Initialize on mount
  onMount(() => {
    const cleanupTheme = initTheme();
    initApps();

    return () => {
      cleanupTheme();
    };
  });
</script>

<NavigationLayout apps={$apps}>
  <SkipLink />
  <main id="main-content" class="main-content">
    {#if $isLoading}
      <div class="page-loader">
        <Loader size="lg" />
      </div>
    {:else}
      <slot />
    {/if}
  </main>
  <Footer />
</NavigationLayout>
