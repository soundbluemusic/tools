/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    // Use jsdom for DOM environment
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./src/test/setup.ts'],

    // Test file patterns
    include: ['src/**/*.{test,spec}.{ts,svelte}'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,svelte}'],
      exclude: [
        'src/**/*.test.{ts,svelte}',
        'src/**/*.spec.{ts,svelte}',
        'src/test/**',
        'src/types/**',
        'src/**/*.d.ts',
      ],
    },

    // Global test settings
    globals: true,

    // CSS handling
    css: true,
  },
});
