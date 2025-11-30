/**
 * useSEO hook tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSEO } from './useSEO';

describe('useSEO', () => {
  const originalTitle = document.title;

  beforeEach(() => {
    // Clear all meta tags before each test
    document.querySelectorAll('meta[name], meta[property]').forEach((el) => el.remove());
    document.querySelector('link[rel="canonical"]')?.remove();
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets document title', () => {
    renderHook(() =>
      useSEO({
        title: 'Test Page',
        description: 'Test description',
      })
    );

    expect(document.title).toBe('Test Page | Productivity Tools');
  });

  it('sets home page title without suffix', () => {
    renderHook(() =>
      useSEO({
        title: 'Home',
        description: 'Home description',
        isHomePage: true,
      })
    );

    expect(document.title).toBe('Productivity Tools');
  });

  it('sets meta description', () => {
    renderHook(() =>
      useSEO({
        title: 'Test',
        description: 'My test description',
      })
    );

    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toBe('My test description');
  });

  it('sets canonical URL', () => {
    renderHook(() =>
      useSEO({
        title: 'Test',
        description: 'Description',
        canonicalPath: '/test-page',
      })
    );

    const link = document.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute('href')).toBe('https://tools.soundbluemusic.com/test-page');
  });

  it('sets Open Graph tags', () => {
    renderHook(() =>
      useSEO({
        title: 'OG Test',
        description: 'OG description',
        ogType: 'article',
      })
    );

    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'OG Test | Productivity Tools'
    );
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(
      'OG description'
    );
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
  });

  it('sets robots meta for noindex pages', () => {
    renderHook(() =>
      useSEO({
        title: 'Private',
        description: 'Private page',
        noindex: true,
      })
    );

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('sets default robots meta for indexed pages', () => {
    renderHook(() =>
      useSEO({
        title: 'Public',
        description: 'Public page',
      })
    );

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toContain('index, follow');
  });

  it('updates meta tags when config changes', () => {
    const { rerender } = renderHook(
      ({ config }) => useSEO(config),
      {
        initialProps: {
          config: { title: 'Initial', description: 'Initial desc' },
        },
      }
    );

    expect(document.title).toBe('Initial | Productivity Tools');

    rerender({
      config: { title: 'Updated', description: 'Updated desc' },
    });

    expect(document.title).toBe('Updated | Productivity Tools');
  });
});
