/**
 * Standalone QR Generator - Vanilla TypeScript Entry Point
 */
import { initTheme } from '../common/standaloneSettings';
import { StandaloneQRApp } from './App';

// Initialize theme before rendering
initTheme('qr');

// Mount the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    const app = new StandaloneQRApp();
    app.mount(root);
  }
});
