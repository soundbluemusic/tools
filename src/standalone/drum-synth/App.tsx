import { useState, useEffect, useCallback } from 'react';
import { DrumSynth } from './DrumSynth';
import { detectLanguage, getTranslations, type Language } from './i18n';

export default function App() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('drum-synth-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const t = getTranslations(language);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('drum-synth-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      localStorage.setItem('drum-synth-lang', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="standalone-app">
      <header className="standalone-header">
        <h1 className="standalone-title">{t.title}</h1>
        <div className="standalone-controls">
          <button
            onClick={toggleLanguage}
            className="standalone-btn"
            title={t.language}
          >
            {language === 'ko' ? 'EN' : '한국어'}
          </button>
          <button
            onClick={toggleTheme}
            className="standalone-btn"
            title={theme === 'light' ? t.darkMode : t.lightMode}
          >
            {theme === 'light' ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
      </header>
      <main className="standalone-main">
        <DrumSynth translations={t} />
      </main>
    </div>
  );
}
