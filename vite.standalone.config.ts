import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

/**
 * Vite configuration for building standalone single-file HTML apps
 * Each tool is bundled into a single HTML file with all assets inlined
 */

// React Compiler configuration
const ReactCompilerConfig = {
  target: '19',
};

// Available standalone apps
const standaloneApps = {
  metronome: resolve(__dirname, 'src/standalone/metronome/index.html'),
  drum: resolve(__dirname, 'src/standalone/drum/index.html'),
  'drum-synth': resolve(__dirname, 'src/standalone/drum-synth/index.html'),
  qr: resolve(__dirname, 'src/standalone/qr/index.html'),
};

// Get app name from command line or build all
const targetApp = process.env.STANDALONE_APP;

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    viteSingleFile({
      removeViteModuleLoader: true,
      useRecommendedBuildConfig: true,
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: false,
    outDir: 'dist/standalone',
    emptyOutDir: false,
    rollupOptions: {
      input: targetApp && standaloneApps[targetApp as keyof typeof standaloneApps]
        ? { [targetApp]: standaloneApps[targetApp as keyof typeof standaloneApps] }
        : standaloneApps,
      output: {
        // Output file names matching the app names
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
    // Inline all assets
    assetsInlineLimit: 100000000,
    // CSS code splitting disabled for single file
    cssCodeSplit: false,
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
});
