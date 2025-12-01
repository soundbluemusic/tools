import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import type { Config } from '@sveltejs/kit';

const config: Config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
    }),
    alias: {
      $components: 'src/components',
      $stores: 'src/stores',
      $i18n: 'src/i18n',
      $utils: 'src/utils',
      $types: 'src/types',
      $apps: 'src/apps',
    },
  },
};

export default config;
