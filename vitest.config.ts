/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    // Use jsdom for DOM environment
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./src/test/setup.ts'],

    // Test file patterns - vanilla TypeScript only
    include: ['src/**/*.{test,spec}.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/test/**',
        'src/types/**',
        'src/**/*.d.ts',
      ],
    },

    // Type checking
    typecheck: {
      enabled: true,
    },

    // Global test settings
    globals: true,

    // CSS handling
    css: true,
  },
});
