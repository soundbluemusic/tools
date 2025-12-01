/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for DOM environment
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./src/test/setup.ts'],

    // Test file patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
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
