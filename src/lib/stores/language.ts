import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Language, Translations } from '$lib/types';
import { translations } from '$lib/i18n/translations';

const LANGUAGE_KEY = 'language';

function getInitialLanguage(): Language {
  if (!browser) return 'ko';

  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored === 'ko' || stored === 'en') {
    return stored;
  }

  // Auto-detect from browser
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ko')) {
    return 'ko';
  }
  return 'en';
}

function createLanguageStore() {
  const { subscribe, set, update } = writable<Language>(getInitialLanguage());

  return {
    subscribe,
    set: (value: Language) => {
      if (browser) {
        localStorage.setItem(LANGUAGE_KEY, value);
        document.documentElement.lang = value;
      }
      set(value);
    },
    toggle: () => {
      update((current) => {
        const next = current === 'ko' ? 'en' : 'ko';
        if (browser) {
          localStorage.setItem(LANGUAGE_KEY, next);
          document.documentElement.lang = next;
        }
        return next;
      });
    }
  };
}

export const language = createLanguageStore();

// Derived store for translations
export const t = derived(language, ($language): Translations => {
  return translations[$language];
});

// Initialize language on client
if (browser) {
  document.documentElement.lang = getInitialLanguage();

  // Listen for storage changes (cross-tab sync)
  window.addEventListener('storage', (e) => {
    if (e.key === LANGUAGE_KEY && e.newValue) {
      const newLang = e.newValue as Language;
      language.set(newLang);
    }
  });
}
