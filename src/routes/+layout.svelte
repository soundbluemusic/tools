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
  import { browser } from '$app/environment';
  import { initTheme, initApps, apps, isLoading } from '$lib/stores';
  import NavigationLayout from '$lib/components/navigation/NavigationLayout.svelte';
  import SkipLink from '$lib/components/SkipLink.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Loader from '$lib/components/ui/Loader.svelte';
  import '../app.css';

  // Initialize on mount (browser only)
  onMount(() => {
    if (browser) {
      const cleanupTheme = initTheme();
      initApps();

      return () => {
        cleanupTheme();
      };
    }
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
