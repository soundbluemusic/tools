<script lang="ts">
  /**
   * @fileoverview Root Application Component
   *
   * ARCHITECTURE: Frontend-Only (No Backend)
   * - This is a 100% client-side application with NO backend server
   * - All data is stored locally via localStorage
   * - PWA with Service Worker enables full offline functionality
   * - No API calls, no server authentication, no external data fetching
   */
  import { onMount } from 'svelte';
  import { Router, Route } from 'svelte-routing';
  import { initTheme, initApps, apps, isLoading } from './stores';

  // Import pages
  import Home from './pages/Home.svelte';
  import Metronome from './pages/Metronome.svelte';
  import Drum from './pages/Drum.svelte';
  import DrumSynth from './pages/DrumSynth.svelte';
  import QR from './pages/QR.svelte';
  import Sitemap from './pages/Sitemap.svelte';
  import OpenSource from './pages/OpenSource.svelte';
  import ToolsUsed from './pages/ToolsUsed.svelte';
  import Privacy from './pages/Privacy.svelte';
  import Terms from './pages/Terms.svelte';
  import NotFound from './pages/NotFound.svelte';

  // Import components
  import NavigationLayout from './components/navigation/NavigationLayout.svelte';
  import SkipLink from './components/SkipLink.svelte';
  import Footer from './components/Footer.svelte';
  import Loader from './components/ui/Loader.svelte';

  import './App.css';

  // Initialize on mount
  onMount(() => {
    const cleanupTheme = initTheme();
    initApps();

    return () => {
      cleanupTheme();
    };
  });

  // URL for svelte-routing
  export let url = '';
</script>

<Router {url}>
  <NavigationLayout apps={$apps}>
    <SkipLink />
    <main id="main-content" class="main-content">
      {#if $isLoading}
        <div class="page-loader">
          <Loader size="lg" />
        </div>
      {:else}
        <Route path="/" component={Home} />
        <Route path="/metronome" component={Metronome} />
        <Route path="/drum" component={Drum} />
        <Route path="/drum-synth" component={DrumSynth} />
        <Route path="/qr" component={QR} />
        <Route path="/sitemap" component={Sitemap} />
        <Route path="/opensource" component={OpenSource} />
        <Route path="/tools-used" component={ToolsUsed} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route component={NotFound} />
      {/if}
    </main>
    <Footer />
  </NavigationLayout>
</Router>
