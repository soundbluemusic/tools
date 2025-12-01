/**
 * @fileoverview Application Entry Point
 *
 * ARCHITECTURE: Frontend-Only PWA (No Backend)
 * - Static files served via Cloudflare Pages CDN
 * - Service Worker enables offline functionality
 * - All user data stored in browser localStorage
 * - No server-side processing or database
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. Make sure there is a <div id="root"></div> in your HTML.'
  );
}

// Create React root and render app
const root = createRoot(rootElement);

// Render without StrictMode in production for better performance
// StrictMode causes double renders in development
if (import.meta.env.DEV) {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  root.render(<App />);
}

// Development-only debug info
if (import.meta.env.DEV) {
  window.__DEBUG__ = {
    version: '1.0.0',
    env: import.meta.env.MODE,
  };
}

// Defer Service Worker registration to after initial render
// This improves initial page load performance
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Wait for page to be fully loaded before registering SW
  window.addEventListener('load', () => {
    // Additional delay to ensure React has rendered
    setTimeout(() => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((error) => {
          console.warn('SW registration failed:', error);
        });
    }, 2000); // 2 second delay after load
  });
}
