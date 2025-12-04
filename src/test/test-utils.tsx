/**
 * Test Utilities
 * Custom render function with providers for Solid.js
 */
import { type JSX } from 'solid-js';
import { render, type RenderResult } from '@solidjs/testing-library';
import { Router } from '@solidjs/router';
import { LanguageProvider } from '../i18n';

/**
 * All providers wrapper for testing
 * Router must wrap LanguageProvider because LanguageProvider uses useLocation
 */
function AllProviders(props: { children: JSX.Element }) {
  return (
    <Router>
      <LanguageProvider>{props.children}</LanguageProvider>
    </Router>
  );
}

/**
 * Custom render function with all providers
 */
function customRender(ui: () => JSX.Element): RenderResult {
  return render(() => <AllProviders>{ui()}</AllProviders>);
}

// Re-export everything from testing-library
export * from '@solidjs/testing-library';
export { userEvent } from '@testing-library/user-event';

// Override render with custom render
export { customRender as render };
