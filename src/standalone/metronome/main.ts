/**
 * Standalone Metronome - Vanilla TypeScript Entry Point
 */
import { initTheme } from '../common/standaloneSettings';
import { StandaloneMetronomeApp } from './App';

// Initialize theme before rendering
initTheme('metronome');

// Mount the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    const app = new StandaloneMetronomeApp();
    app.mount(root);
  }
});
