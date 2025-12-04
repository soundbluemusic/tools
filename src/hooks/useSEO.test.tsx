/**
 * useSEO hook tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@solidjs/testing-library';
import { type JSX } from 'solid-js';
import { Router } from '@solidjs/router';
import { useSEO } from './useSEO';
import { BRAND } from '../constants';
import { LanguageProvider } from '../i18n';

// Wrapper component for hooks that need LanguageProvider
// Router must wrap LanguageProvider because LanguageProvider uses useLocation
const wrapper = (props: { children: JSX.Element }) => (
  <Router>
    <LanguageProvider>{props.children}</LanguageProvider>
  </Router>
);

describe('useSEO', () => {
  const originalTitle = document.title;

  beforeEach(() => {
    // Clear all meta tags before each test
    document
      .querySelectorAll('meta[name], meta[property]')
      .forEach((el) => el.remove());
    document.querySelector('link[rel="canonical"]')?.remove();
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets document title', () => {
    renderHook(
      () =>
        useSEO({
          title: 'Test Page',
          description: 'Test description',
        }),
      { wrapper }
    );

    expect(document.title).toBe('Test Page | Tools');
  });

  it('sets home page title without suffix', () => {
    renderHook(
      () =>
        useSEO({
          title: 'Home',
          description: 'Home description',
          isHomePage: true,
        }),
      { wrapper }
    );

    expect(document.title).toBe('Tools');
  });

  it('sets meta description', () => {
    renderHook(
      () =>
        useSEO({
          title: 'Test',
          description: 'My test description',
        }),
      { wrapper }
    );

    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toBe('My test description');
  });

  it('sets canonical URL', () => {
    renderHook(
      () =>
        useSEO({
          title: 'Test',
          description: 'Description',
          canonicalPath: '/test-page',
        }),
      { wrapper }
    );

    const link = document.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute('href')).toBe(`${BRAND.siteUrl}/test-page`);
  });

  it('sets Open Graph tags', () => {
    renderHook(
      () =>
        useSEO({
          title: 'OG Test',
          description: 'OG description',
          ogType: 'article',
        }),
      { wrapper }
    );

    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content')
    ).toBe('OG Test | Tools');
    expect(
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content')
    ).toBe('OG description');
    expect(
      document
        .querySelector('meta[property="og:type"]')
        ?.getAttribute('content')
    ).toBe('article');
  });

  it('sets robots meta for noindex pages', () => {
    renderHook(
      () =>
        useSEO({
          title: 'Private',
          description: 'Private page',
          noindex: true,
        }),
      { wrapper }
    );

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('sets default robots meta for indexed pages', () => {
    renderHook(
      () =>
        useSEO({
          title: 'Public',
          description: 'Public page',
        }),
      { wrapper }
    );

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toContain('index, follow');
  });

  it('updates meta tags when config changes', () => {
    const { rerender } = renderHook(
      (config: { title: string; description: string }) => useSEO(config),
      {
        initialProps: { title: 'Initial', description: 'Initial desc' },
        wrapper,
      }
    );

    expect(document.title).toBe('Initial | Tools');

    rerender({ title: 'Updated', description: 'Updated desc' });

    expect(document.title).toBe('Updated | Tools');
  });
});
