export type Language = 'ko' | 'en';

export interface Translations {
  title: string;
  play: string;
  pause: string;
  stop: string;
  clear: string;
  tempo: string;
  kick: string;
  snare: string;
  hihat: string;
  openhat: string;
  clap: string;
  step: string;
  volume: string;
  presets: string;
  presetTechno: string;
  presetHouse: string;
  presetTrap: string;
  presetBreakbeat: string;
  presetMinimal: string;
  loop: string;
  addLoop: string;
  removeLoop: string;
  copyLoop: string;
  maxLoopsReached: string;
  clearAllLoops: string;
  loadedPreset: string;
  synthesisInfo: string;
  lightMode: string;
  darkMode: string;
  language: string;
}

export const translations: Record<Language, Translations> = {
  ko: {
    title: '드럼머신',
    play: '재생',
    pause: '일시정지',
    stop: '정지',
    clear: '초기화',
    tempo: '템포',
    kick: '킥',
    snare: '스네어',
    hihat: '하이햇',
    openhat: '오픈햇',
    clap: '클랩',
    step: '스텝',
    volume: '볼륨',
    presets: '프리셋',
    presetTechno: '테크노',
    presetHouse: '하우스',
    presetTrap: '트랩',
    presetBreakbeat: '브레이크비트',
    presetMinimal: '미니멀',
    loop: '루프',
    addLoop: '루프 추가',
    removeLoop: '루프 삭제',
    copyLoop: '루프 복사',
    maxLoopsReached: '최대 루프 수에 도달했습니다',
    clearAllLoops: '모든 루프가 초기화됩니다',
    loadedPreset: '{preset} 프리셋을 불러왔습니다',
    synthesisInfo: '모든 드럼 소리는 Web Audio API로 실시간 합성됩니다',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    language: '언어',
  },
  en: {
    title: 'Drum Machine',
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    clear: 'Clear',
    tempo: 'Tempo',
    kick: 'Kick',
    snare: 'Snare',
    hihat: 'HiHat',
    openhat: 'OpenHat',
    clap: 'Clap',
    step: 'Step',
    volume: 'Volume',
    presets: 'Presets',
    presetTechno: 'Techno',
    presetHouse: 'House',
    presetTrap: 'Trap',
    presetBreakbeat: 'Breakbeat',
    presetMinimal: 'Minimal',
    loop: 'Loop',
    addLoop: 'Add Loop',
    removeLoop: 'Remove Loop',
    copyLoop: 'Copy Loop',
    maxLoopsReached: 'Maximum loops reached',
    clearAllLoops: 'All loops will be cleared',
    loadedPreset: 'Loaded {preset} preset',
    synthesisInfo:
      'All drum sounds are synthesized in real-time using Web Audio API',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function detectLanguage(): Language {
  const stored = localStorage.getItem('drum-lang');
  if (stored === 'ko' || stored === 'en') return stored;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ko') ? 'ko' : 'en';
}
