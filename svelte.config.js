import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-cloudflare for Cloudflare Pages deployment
    adapter: adapter(),
    alias: {
      $components: 'src/lib/components',
      $stores: 'src/lib/stores',
      $i18n: 'src/lib/i18n',
      $utils: 'src/lib/utils',
      $types: 'src/lib/types',
      $apps: 'src/lib/apps'
    }
  }
};

export default config;
