/**
 * Simplified i18n for standalone metronome
 */

export type Language = 'ko' | 'en';

export interface Translations {
  title: string;
  bpm: string;
  volume: string;
  timeSignature: string;
  timer: string;
  measure: string;
  elapsed: string;
  countdown: string;
  slow: string;
  fast: string;
  quiet: string;
  loud: string;
  minutes: string;
  seconds: string;
  start: string;
  stop: string;
  perfectSync: string;
  syncDescription: string;
  precision: string;
  lightMode: string;
  darkMode: string;
  language: string;
}

export const translations: Record<Language, Translations> = {
  ko: {
    title: '메트로놈',
    bpm: '속도',
    volume: '볼륨',
    timeSignature: '박자',
    timer: '타이머',
    measure: '마디',
    elapsed: '경과 시간',
    countdown: '남은 시간',
    slow: '느리게',
    fast: '빠르게',
    quiet: '조용히',
    loud: '크게',
    minutes: '분',
    seconds: '초',
    start: '시작',
    stop: '일시정지',
    perfectSync: '완벽 동기화',
    syncDescription: '완벽한 BPM-시간 동기화 | 60 BPM = 정확히 1초 | 120 BPM = 정확히 0.5초',
    precision: '±0.01s',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    language: '언어',
  },
  en: {
    title: 'Metronome',
    bpm: 'Tempo',
    volume: 'Volume',
    timeSignature: 'Time Sig.',
    timer: 'Timer',
    measure: 'Measure',
    elapsed: 'Elapsed',
    countdown: 'Remaining',
    slow: 'Slow',
    fast: 'Fast',
    quiet: 'Quiet',
    loud: 'Loud',
    minutes: 'min',
    seconds: 'sec',
    start: 'Start',
    stop: 'Pause',
    perfectSync: 'Perfect Sync',
    syncDescription: 'Perfect BPM-Time Sync | 60 BPM = exactly 1s | 120 BPM = exactly 0.5s',
    precision: '±0.01s',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function detectLanguage(): Language {
  const stored = localStorage.getItem('metronome-lang');
  if (stored === 'ko' || stored === 'en') return stored;

  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ko') ? 'ko' : 'en';
}
