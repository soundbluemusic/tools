/**
 * Standalone Drum Machine - Vanilla TypeScript Entry Point
 */
import { initTheme } from '../common/standaloneSettings';
import { StandaloneDrumApp } from './App';

// Initialize theme before rendering
initTheme('drum');

// Mount the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    const app = new StandaloneDrumApp();
    app.mount(root);
  }
});
