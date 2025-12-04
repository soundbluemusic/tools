/**
 * Test Utilities
 * Custom render function with providers
 */
import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../i18n';

/**
 * All providers wrapper for testing
 * BrowserRouter must wrap LanguageProvider because LanguageProvider uses useLocation
 */
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <LanguageProvider>{children}</LanguageProvider>
    </BrowserRouter>
  );
}

/**
 * Custom render function with all providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

// Override render with custom render
export { customRender as render };
