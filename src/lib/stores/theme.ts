import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Theme, ResolvedTheme } from '$lib/types';

const THEME_KEY = 'theme';

function getInitialTheme(): Theme {
  if (!browser) return 'system';

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (!browser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(getInitialTheme());

  return {
    subscribe,
    set: (value: Theme) => {
      if (browser) {
        localStorage.setItem(THEME_KEY, value);
        applyTheme(value);
      }
      set(value);
    },
    cycle: () => {
      update((current) => {
        const themes: Theme[] = ['system', 'light', 'dark'];
        const nextIndex = (themes.indexOf(current) + 1) % themes.length;
        const next = themes[nextIndex];
        if (browser) {
          localStorage.setItem(THEME_KEY, next);
          applyTheme(next);
        }
        return next;
      });
    }
  };
}

function applyTheme(theme: Theme) {
  if (!browser) return;

  const root = document.documentElement;

  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export const theme = createThemeStore();

// Derived store for the actual resolved theme
export const resolvedTheme = derived(theme, ($theme): ResolvedTheme => {
  if ($theme === 'system') {
    return getSystemTheme();
  }
  return $theme;
});

// Initialize theme on client
if (browser) {
  // Apply initial theme
  applyTheme(getInitialTheme());

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    // Trigger update if using system theme
    theme.set(getInitialTheme());
  });

  // Listen for storage changes (cross-tab sync)
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_KEY && e.newValue) {
      const newTheme = e.newValue as Theme;
      theme.set(newTheme);
    }
  });
}
