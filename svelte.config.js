import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // 현재: adapter-static (정적 사이트)
    // 나중에 Workers 필요시: adapter-cloudflare로 변경
    // import adapter from '@sveltejs/adapter-cloudflare';
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true
    }),
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
